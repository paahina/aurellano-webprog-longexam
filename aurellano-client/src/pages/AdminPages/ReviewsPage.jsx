import { useEffect, useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";
import AdminModal from "../../components/Admin/AdminModal";
import AdminTablePagination from "../../components/Admin/AdminTablePagination";
import AdminTableSkeleton from "../../components/Admin/AdminTableSkeleton";
import AdminTableToolbar, { DATE_SORT_OPTIONS, dateSortToQuery } from "../../components/Admin/AdminTableToolbar";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProductImage from "../../components/ProductImage";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useAdminTableQuery } from "../../hooks/useAdminTableQuery";
import {
  deleteReviewRequest,
  getReviewsPagedRequest,
  getSupplierReviewsPagedRequest,
  updateReviewRequest,
} from "../../services/api";
import { formatDate } from "../../utils/format";
import { toUserError } from "../../utils/userError";

const PAGE_SIZE = 10;

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none";

const AdminReviewsPage = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const isSupplier = user?.userRole === "supplier";
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ reviewRating: 5, reviewComment: "" });
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { sort, search, page, setSort, setPage, updateParam } = useAdminTableQuery(
    "newest",
    DATE_SORT_OPTIONS.map((option) => option.value)
  );
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam("search", searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, updateParam]);

  const load = async () => {
    setLoading(true);
    try {
      const query = { sort: dateSortToQuery(sort), page, limit: PAGE_SIZE };
      if (search) query.search = search;
      const data = isSupplier
        ? await getSupplierReviewsPagedRequest(query, token)
        : await getReviewsPagedRequest(query, token);
      setReviews(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      showToast(toUserError(err), "error");
      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, sort, search, page, isSupplier]);

  useEffect(() => {
    if (loading || page <= totalPages) return;
    setPage(totalPages);
  }, [loading, page, totalPages, setPage]);

  const openEdit = (review) => {
    if (isSupplier) return;
    setEditing(review);
    setForm({
      reviewRating: review.reviewRating || 5,
      reviewComment: review.reviewComment || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    if (isSupplier) return;
    setSaving(true);
    try {
      await updateReviewRequest(
        editing._id,
        {
          reviewRating: Number(form.reviewRating),
          reviewComment: form.reviewComment,
        },
        token
      );
      showToast("Review updated.", "success");
      closeModal();
      await load();
    } catch (err) {
      showToast(toUserError(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (review) => {
    if (isSupplier) return;
    setDeleteTarget(review);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteReviewRequest(deleteTarget._id, token);
      showToast("Review deleted.", "success");
      setDeleteTarget(null);
      await load();
    } catch (err) {
      showToast(toUserError(err), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Feedback
      </p>
      <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
        <Star className="h-7 w-7" strokeWidth={2} />
        Reviews
      </h1>

      <AdminTableToolbar
        sort={sort}
        onSortChange={setSort}
        sortOptions={DATE_SORT_OPTIONS}
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search by customer or product"
      />

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {loading ? (
          <AdminTableSkeleton columns={6} label="Loading reviews" />
        ) : !reviews.length ? (
          <p className="p-6 text-sm text-zinc-600">
            {search ? "No reviews match your search." : "No reviews yet."}
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-primary text-neutral1">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Comment</th>
                <th className="px-4 py-3 font-semibold">Reviewed</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                        <ProductImage
                          src={review.productId?.productImage}
                          alt={review.productId?.productName || "Product"}
                          className="aspect-square w-10 object-cover"
                          iconClassName="h-4 w-4"
                        />
                      </div>
                      <span className="font-medium text-primary">
                        {review.productId?.productName || "Product"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {review.userId?.firstName} {review.userId?.lastName}
                  </td>
                  <td className="px-4 py-3">{review.reviewRating}/5</td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-600">
                    {review.reviewComment || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatDate(review.createdAt) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isSupplier ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="custom5" onClick={() => openEdit(review)}>
                          <span className="inline-flex items-center gap-1">
                            <Pencil className="h-3 w-3" />
                            Edit
                          </span>
                        </Button>
                        <Button type="button" variant="danger" onClick={() => requestDelete(review)}>
                          <span className="inline-flex items-center gap-1">
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </span>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <AdminModal open={!isSupplier && modalOpen} title="Edit review" onClose={closeModal}>
        {editing ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-zinc-600">
              {editing.productId?.productName} · {editing.userId?.firstName}{" "}
              {editing.userId?.lastName}
            </p>
            <label className="block text-sm">
              Rating
              <select
                value={form.reviewRating}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reviewRating: event.target.value }))
                }
                className={inputClass}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Comment
              <textarea
                value={form.reviewComment}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reviewComment: event.target.value }))
                }
                className={`${inputClass} min-h-28`}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="custom2" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="custom5" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete review"
        message="Delete this review? This cannot be undone."
        confirmLabel="Yes"
        cancelLabel="No"
        loading={deleting}
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminReviewsPage;
