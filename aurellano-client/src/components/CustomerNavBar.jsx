import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCartsRequest } from "../services/api";
import logo from "../assets/img/nubdexchange_logo.png";

const iconNavClassName = ({ isActive }) =>
  [
    "relative inline-flex items-center justify-center rounded-xl border-2 p-2.5 transition",
    isActive
      ? "border-secondary bg-secondary text-shade"
      : "border-transparent text-neutral1 hover:border-neutral1 hover:bg-neutral1 hover:text-shade",
  ].join(" ");

const CustomerNavBar = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(urlSearch);
  const [cartCount, setCartCount] = useState(0);
  const cartRequestId = useRef(0);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setSearchValue(urlSearch);
  }, [urlSearch]);

  const refreshCartCount = useCallback(async () => {
    const requestId = ++cartRequestId.current;

    if (!token) {
      if (requestId === cartRequestId.current) setCartCount(0);
      return;
    }

    try {
      const carts = await getCartsRequest(token);
      const items = carts[0]?.cartItems || [];
      const total = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      if (requestId === cartRequestId.current) setCartCount(total);
    } catch {
      if (requestId === cartRequestId.current) setCartCount(0);
    }
  }, [token]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount, location.pathname]);

  useEffect(() => {
    const onCartUpdated = () => {
      refreshCartCount();
    };
    window.addEventListener("cart-updated", onCartUpdated);
    return () => window.removeEventListener("cart-updated", onCartUpdated);
  }, [refreshCartCount]);

  const onSearch = (event) => {
    event.preventDefault();
    const nextQuery = searchValue.trim();
    const params = new URLSearchParams();
    if (nextQuery) params.set("search", nextQuery);
    if (location.pathname.startsWith("/shop")) {
      const category = searchParams.get("category");
      const sort = searchParams.get("sort");
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
    }
    const qs = params.toString();
    navigate(qs ? `/shop?${qs}` : "/shop");
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary shadow-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:px-8">
        <Link to="/shop" className="flex items-center gap-3">
          <img
            src={logo}
            alt="BulldogExchange"
            className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-zinc-50 object-contain"
          />
          <p className="text-lg font-bold text-secondary">BulldogExchange</p>
        </Link>

        <form onSubmit={onSearch} className="relative w-full flex-1">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            id="product-search"
            name="search"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-full border-2 border-secondary bg-neutral1 py-2 pr-4 pl-10 text-sm text-zinc-900 outline-none"
          />
        </form>

        <nav className="flex items-center justify-end gap-2">
          <NavLink
            to="/account/cart"
            className={() =>
              iconNavClassName({
                isActive: location.pathname.startsWith("/account"),
              })
            }
            title="Cart"
            aria-label={cartCount ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={2} />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </NavLink>
          <NavLink
            to="/profile"
            className={iconNavClassName}
            title={user?.firstName || "Profile"}
            aria-label="Profile"
          >
            <User className="h-5 w-5" strokeWidth={2} />
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default CustomerNavBar;
