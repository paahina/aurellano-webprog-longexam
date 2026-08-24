import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import ListEmptyState from "../../components/Customer/ListEmptyState";
import ListSkeleton from "../../components/Customer/ListSkeleton";
import OrderCard from "../../components/Customer/OrderCard";
import { useAuth } from "../../context/AuthContext";
import { getOrdersRequest, updateOrderRequest } from "../../services/api";

const toLoadMessage = (err) => {
  const raw = err?.message || "";
  if (!raw || raw === "Failed to fetch") {
    return "Could not reach the server. Please try again later.";
  }
  return raw;
};

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setLoadError("");
    setError("");
    setOrders([]);
    try {
      const data = await getOrdersRequest(token, { ongoing: "true" });
      setOrders(data);
    } catch (err) {
      setOrders([]);
      setLoadError(toLoadMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  const cancelOrder = async (id) => {
    try {
      await updateOrderRequest(id, { orderStatus: "cancelled" }, token);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="rounded-3xl bg-zinc-100 p-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold text-primary">
        <ClipboardList className="h-6 w-6" strokeWidth={2} />
        Ongoing orders
      </h2>
      {!loading && !loadError && error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? <ListSkeleton variant="order" count={3} label="Loading orders" /> : null}

      {!loading && (loadError || !orders.length) ? (
        <ListEmptyState
          icon={ClipboardList}
          title={loadError ? "Unable to load orders" : "No orders found"}
          message={loadError || "No pending or ready-for-claiming orders."}
        />
      ) : null}

      {!loading && !loadError && orders.length ? (
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onCancel={cancelOrder} />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default OrdersPage;
