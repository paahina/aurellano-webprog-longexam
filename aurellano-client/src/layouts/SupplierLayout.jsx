import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  Star,
  User,
  ClipboardList,
} from "lucide-react";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/img/nubdexchange_logo.png";

const navItems = [
  { to: "/supplier", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/supplier/products", label: "Products", icon: Package },
  { to: "/supplier/orders", label: "Orders", icon: ClipboardList },
  { to: "/supplier/reviews", label: "Reviews", icon: Star },
  { to: "/supplier/profile", label: "Profile", icon: User },
];

const linkClass = (collapsed) =>
  ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
      collapsed ? "justify-center" : "",
      isActive
        ? "bg-secondary text-shade"
        : "text-neutral1 hover:bg-white/10",
    ].join(" ");

const SupplierLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-neutral2 text-zinc-900">
      <aside
        className={[
          "sticky top-0 flex h-screen shrink-0 flex-col bg-primary text-neutral1 transition-[width]",
          collapsed ? "w-20" : "w-64",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <img
            src={logo}
            alt="BulldogExchange"
            className="h-10 w-10 rounded-full border-2 border-secondary bg-zinc-50 object-contain"
          />
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-secondary">BulldogExchange</p>
              <p className="truncate text-[11px] uppercase tracking-[0.18em] text-neutral1/70">
                Supplier
              </p>
            </div>
          ) : null}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass(collapsed)}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              {!collapsed ? <span>{label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="m-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/10"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-primary px-4 py-3 text-neutral1 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-secondary">
              {user?.firstName} {user?.lastName}
            </p>
            <Button type="button" variant="custom2" onClick={onLogout}>
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                Log Out
              </span>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupplierLayout;

