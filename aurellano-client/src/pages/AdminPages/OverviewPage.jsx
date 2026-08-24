import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { getOrdersRequest, getProductsRequest, getReviewsRequest, getUsersRequest } from "../../services/api";

const OverviewPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    products: 0,
    pendingOrders: 0,
    reviews: 0,
    users: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [products, orders, reviews, users] = await Promise.all([
          getProductsRequest({ limit: 100 }),
          getOrdersRequest(token, { status: "pending" }),
          getReviewsRequest(),
          getUsersRequest(token),
        ]);
        setCounts({
          products: products.length,
          pendingOrders: orders.length,
          reviews: reviews.length,
          users: users.length,
        });
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-primary px-4 py-4 text-neutral1">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="font-bold text-secondary">Admin overview</p>
          <Button type="button" variant="custom2" onClick={onLogout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-primary">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Admin table pages for products, orders, reviews, and users come next.
        </p>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Products", counts.products],
            ["Pending orders", counts.pendingOrders],
            ["Reviews", counts.reviews],
            ["Users", counts.users],
          ].map(([label, value]) => (
            <article key={label} className="rounded-3xl bg-white p-5">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                {label}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OverviewPage;
