import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import AdminModal from "../../components/Admin/AdminModal";
import AdminTablePagination from "../../components/Admin/AdminTablePagination";
import AdminTableSkeleton from "../../components/Admin/AdminTableSkeleton";
import AdminTableToolbar, {
  GENERIC_SORT_OPTIONS,
  genericSortToQuery,
} from "../../components/Admin/AdminTableToolbar";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useAdminTableQuery } from "../../hooks/useAdminTableQuery";
import {
  createUserByAdminRequest,
  deleteUserRequest,
  getUsersPagedRequest,
  updateUserRequest,
} from "../../services/api";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 10;

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  userRole: "customer",
  isActive: true,
  supplierName: "",
  supplierDescription: "",
  newPassword: "",
  confirmPassword: "",
};

const AdminUsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { sort, page, setSort, setPage } = useAdminTableQuery(
    "az",
    GENERIC_SORT_OPTIONS.map((option) => option.value)
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsersPagedRequest(token, {
        sort: genericSortToQuery(sort),
        page,
        limit: PAGE_SIZE,
      });
      setUsers(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, sort, page]);

  useEffect(() => {
    if (loading || page <= totalPages) return;
    setPage(totalPages);
  }, [loading, page, totalPages, setPage]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
    setMessage("");
    setError("");
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      userRole: user.userRole || "customer",
      isActive: user.isActive !== false,
      supplierName: user.supplierId?.supplierName || "",
      supplierDescription: user.supplierId?.supplierDescription || "",
      newPassword: "",
      confirmPassword: "",
    });
    setModalOpen(true);
    setMessage("");
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const newPassword = form.newPassword.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!editing) {
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Password and confirm password do not match.");
        return;
      }
    } else if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!editing) {
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: newPassword,
          userRole: form.userRole,
          isActive: form.userRole === "Admin" ? true : form.isActive,
        };
        if (form.userRole === "supplier") {
          payload.supplierName = form.supplierName.trim();
          payload.supplierDescription = form.supplierDescription.trim();
        }
        await createUserByAdminRequest(payload, token);
        setMessage("User created.");
      } else {
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
        };
        if (editing.userRole !== "Admin") {
          payload.userRole = form.userRole;
          payload.isActive = form.isActive;
          if (form.userRole === "supplier") {
            payload.supplierName = form.supplierName?.trim();
            payload.supplierDescription = form.supplierDescription?.trim();
          }
        }
        if (newPassword) {
          payload.password = newPassword;
        }
        await updateUserRequest(editing._id, payload, token);
        setMessage("User updated.");
      }
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (user) => {
    if (user.userRole === "Admin") {
      setError("Admin accounts cannot be deleted from this panel.");
      return;
    }
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    setError("");
    setMessage("");
    try {
      await deleteUserRequest(user._id, token);
      setMessage("User deleted.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const showSupplierFields =
    (!editing || editing.userRole !== "Admin") && form.userRole === "supplier";
  const editingAdmin = Boolean(editing && editing.userRole === "Admin");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Access
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
            <Users className="h-7 w-7" strokeWidth={2} />
            Users
          </h1>
        </div>
        <Button type="button" variant="custom2" onClick={openCreate}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Create user
          </span>
        </Button>
      </div>

      {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <AdminTableToolbar
        sort={sort}
        onSortChange={setSort}
        sortOptions={GENERIC_SORT_OPTIONS}
      />

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {loading ? (
          <AdminTableSkeleton columns={6} label="Loading users" />
        ) : !users.length ? (
          <p className="p-6 text-sm text-zinc-600">No users found.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-primary text-neutral1">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium text-primary">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                  <td className="px-4 py-3">{user.userRole}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    {user.isActive === false ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        Inactive
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="custom5" onClick={() => openEdit(user)}>
                        <span className="inline-flex items-center gap-1">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </span>
                      </Button>
                      {user.userRole !== "Admin" ? (
                        <Button type="button" variant="danger" onClick={() => onDelete(user)}>
                          <span className="inline-flex items-center gap-1">
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit user" : "Create user"}
        onClose={closeModal}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            First name
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            Last name
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              className={inputClass}
            />
          </label>
          {editingAdmin ? (
            <p className="text-sm text-zinc-600">Role: Admin (cannot be changed)</p>
          ) : (
            <label className="block text-sm">
              Role
              <select
                name="userRole"
                value={form.userRole}
                onChange={onChange}
                className={inputClass}
              >
                <option value="customer">customer</option>
                <option value="supplier">supplier</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
          )}
          {showSupplierFields ? (
            <>
              <label className="block text-sm">
                Supplier name
                <input
                  name="supplierName"
                  value={form.supplierName}
                  onChange={onChange}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                Supplier description
                <textarea
                  name="supplierDescription"
                  value={form.supplierDescription}
                  onChange={onChange}
                  required
                  className={`${inputClass} min-h-28`}
                />
              </label>
            </>
          ) : null}
          {editing ? (
            <p className="text-sm text-zinc-600">
              Created: {formatDate(editing.createdAt) || "—"}
            </p>
          ) : null}
          {!editingAdmin ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={onChange}
                disabled={form.userRole === "Admin"}
              />
              Active account
            </label>
          ) : (
            <p className="text-sm text-zinc-600">Admin accounts cannot be deactivated.</p>
          )}
          <div className="border-t border-zinc-200 pt-4">
            <p className="text-sm font-medium text-primary">
              {editing ? "Change password (optional)" : "Password"}
            </p>
            {editing ? (
              <p className="mt-1 text-xs text-zinc-500">
                Leave blank to keep the current password.
              </p>
            ) : null}
            <label className="mt-3 block text-sm">
              {editing ? "New password" : "Password"}
              <input
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={onChange}
                autoComplete="new-password"
                minLength={6}
                required={!editing}
                className={inputClass}
              />
            </label>
            <label className="mt-3 block text-sm">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={onChange}
                autoComplete="new-password"
                minLength={6}
                required={!editing}
                className={inputClass}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="custom2" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create"}
            </Button>
            <Button type="button" variant="custom5" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminUsersPage;
