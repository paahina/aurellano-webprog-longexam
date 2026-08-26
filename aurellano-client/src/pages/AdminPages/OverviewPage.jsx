import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getOrdersRequest,
  getProductsRequest,
  getReviewsRequest,
  getSupplierProductsRequest,
  getSupplierReviewsRequest,
  getUsersRequest,
} from "../../services/api";

const OverviewPage = () => {
  const { token, user } = useAuth();
  const isSupplier = user?.userRole === "supplier";
  const [counts, setCounts] = useState({
    products: 0,
    pendingOrders: 0,
    reviews: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (isSupplier) {
          const [productResult, orders] = await Promise.all([
            getSupplierProductsRequest({ limit: 1 }, token),
            getOrdersRequest(token, { status: "pending" }),
          ]);
          const reviews = await getSupplierReviewsRequest({}, token);
          if (cancelled) return;
          setCounts({
            products: productResult.total,
            pendingOrders: orders.length,
            reviews: (reviews || []).length,
            users: 0,
          });
          return;
        }

        const [productResult, orders, reviews, users] = await Promise.all([
          getProductsRequest({ limit: 100 }),
          getOrdersRequest(token, { status: "pending" }),
          getReviewsRequest(),
          getUsersRequest(token),
        ]);
        if (cancelled) return;
        setCounts({
          products: productResult.total,
          pendingOrders: orders.length,
          reviews: reviews.length,
          users: users.length,
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, isSupplier]);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Dashboard
      </p>
      <h1 className="mt-2 text-3xl font-bold text-primary">
        Welcome, {user?.firstName}
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Overview of BulldogExchange store activity.
      </p>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <div
          className={
            isSupplier ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {Array.from({ length: isSupplier ? 2 : 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl bg-white" />
          ))}
        </div>
      ) : (
        <div
          className={
            isSupplier ? "mt-8 grid gap-4 sm:grid-cols-2" : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          }
        >
          {(
            isSupplier
              ? [
                  ["Products", counts.products],
                  ["Reviews", counts.reviews],
                ]
              : [
                  ["Products", counts.products],
                  ["Pending orders", counts.pendingOrders],
                  ["Reviews", counts.reviews],
                  ["Users", counts.users],
                ]
          ).map(([label, value]) => (
            <article key={label} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                {label}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverviewPage;
