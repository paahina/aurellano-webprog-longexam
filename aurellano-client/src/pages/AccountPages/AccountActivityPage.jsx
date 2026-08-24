import { NavLink, Outlet } from "react-router-dom";
import { ClipboardList, ShoppingCart, Star } from "lucide-react";

const tabClassName = ({ isActive }) =>
  [
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition",
    isActive ? "bg-secondary text-shade" : "bg-white text-primary hover:bg-secondary/70",
  ].join(" ");

const AccountActivityPage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-bold text-primary">Your activity</h1>
      <div className="mt-6 flex flex-wrap gap-2 rounded-2xl bg-primary p-3">
        <NavLink to="/account/cart" className={tabClassName}>
          <ShoppingCart className="h-4 w-4" strokeWidth={2} />
          Cart
        </NavLink>
        <NavLink to="/account/orders" className={tabClassName}>
          <ClipboardList className="h-4 w-4" strokeWidth={2} />
          Orders
        </NavLink>
        <NavLink to="/account/reviews" className={tabClassName}>
          <Star className="h-4 w-4" strokeWidth={2} />
          Reviews
        </NavLink>
      </div>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AccountActivityPage;
