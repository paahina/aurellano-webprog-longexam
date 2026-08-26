import { useEffect, useState } from "react";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import AdminModal from "../../components/Admin/AdminModal";
import AdminTablePagination from "../../components/Admin/AdminTablePagination";
import AdminTableSkeleton from "../../components/Admin/AdminTableSkeleton";
import AdminTableToolbar, { DATE_SORT_OPTIONS, dateSortToQuery } from "../../components/Admin/AdminTableToolbar";
import OrderStatusChip from "../../components/Admin/OrderStatusChip";
import Button from "../../components/Button";
import OrderItemColumn from "../../components/Customer/OrderItemColumn";
import { useAuth } from "../../context/AuthContext";
import { useAdminTableQuery } from "../../hooks/useAdminTableQuery";
import {
  deleteOrderRequest,
  getOrdersPagedRequest,
  updateOrderRequest,
} from "../../services/api";
import { formatDate, formatPeso } from "../../utils/format";

const PAGE_SIZE = 10;

const statusLabel = {
  pending: "Pending",
  confirmed: "Ready for claiming",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const inputClass =
  "mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none";

const AdminOrdersPage = () => {
  const { token, user } = useAuth();
  const isSupplier = user?.userRole === "supplier";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [pickupDetails, setPickupDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { sort, page, setSort, setPage } = useAdminTableQuery(
    "newest",
    DATE_SORT_OPTIONS.map((option) => option.value)
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrdersPagedRequest(token, {
        sort: dateSortToQuery(sort),
        page,
        limit: PAGE_SIZE,
      });
      setOrders(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
      setOrders([]);
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

  const openEdit = (order) => {
    setEditing(order);
    setOrderStatus(order.orderStatus || "pending");
    setPickupDetails(order.pickupDetails || "");
    setModalOpen(true);
    setMessage("");
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateOrderRequest(
        editing._id,
        { orderStatus, pickupDetails },
        token
      );
      setMessage("Order updated.");
      closeModal();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (order) => {
    if (!window.confirm("Delete this order?")) return;
    setError("");
    setMessage("");
    try {
      await deleteOrderRequest(order._id, token);
      setMessage("Order deleted.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Fulfillment
      </p>
      <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
        <ClipboardList className="h-7 w-7" strokeWidth={2} />
        Orders
      </h1>

      {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <AdminTableToolbar
        sort={sort}
        onSortChange={setSort}
        sortOptions={DATE_SORT_OPTIONS}
      />

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white shadow-sm">
        {loading ? (
          <AdminTableSkeleton columns={isSupplier ? 5 : 6} label="Loading orders" />
        ) : !orders.length ? (
          <p className="p-6 text-sm text-zinc-600">No orders yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-primary text-neutral1">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                {!isSupplier ? (
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                ) : null}
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Ordered</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-zinc-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary">
                      {order.userId?.firstName} {order.userId?.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">{order.userId?.email}</p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {(order.orderItems || [])
                        .map((item) => `${item.productName} ×${item.quantity}`)
                        .join(", ")}
                    </p>
                  </td>
                  {!isSupplier ? (
                    <td className="px-4 py-3">
                      {order.supplierId?.supplierName || "—"}
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <OrderStatusChip status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3">{formatPeso(order.totalAmount)}</td>
                  <td className="px-4 py-3">{formatDate(order.orderedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="custom5" onClick={() => openEdit(order)}>
                        <span className="inline-flex items-center gap-1">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </span>
                      </Button>
                      {!isSupplier ? (
                        <Button type="button" variant="danger" onClick={() => onDelete(order)}>
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
        {!loading ? (
          <AdminTablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            label="Orders pagination"
          />
        ) : null}
      </div>

      <AdminModal open={modalOpen} title="Edit order" onClose={closeModal} wide>
        {editing ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-zinc-600">
              {editing.userId?.firstName} {editing.userId?.lastName} ·{" "}
              {formatPeso(editing.totalAmount)}
            </p>

            <div className="flex gap-4 overflow-x-auto pb-1">
              {editing.orderItems?.map((item, index) => (
                <OrderItemColumn
                  key={`${editing._id}-${item.productId}-${index}`}
                  item={item}
                  linkable={false}
                />
              ))}
            </div>

            <label className="block text-sm">
              Status
              <select
                value={orderStatus}
                onChange={(event) => setOrderStatus(event.target.value)}
                className={inputClass}
              >
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <OrderStatusChip status={orderStatus} />
            </div>
            <label className="block text-sm">
              Pickup details
              <input
                value={pickupDetails}
                onChange={(event) => setPickupDetails(event.target.value)}
                className={inputClass}
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
    </div>
  );
};

export default AdminOrdersPage;
