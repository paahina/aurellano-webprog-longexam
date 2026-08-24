import { Link } from "react-router-dom";
import logo from "../assets/img/nubdexchange_logo.png";

const Footer = ({
  productsTo = "/products",
  cartTo = "/account/cart",
  ordersTo = "/account/orders",
}) => {
  return (
    <div className="bg-primary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-zinc-50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20">
            <img src={logo} alt="" />
          </div>
          <div>
            <p className="text-lg font-bold text-secondary">BulldogEx Shop</p>
            <p className="mt-1 text-sm text-zinc-300">
              Campus essentials, simple ordering.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
          <Link to={productsTo} className="transition hover:text-secondary">
            Products
          </Link>
          <span aria-hidden="true">|</span>
          <Link to={cartTo} className="transition hover:text-secondary">
            Cart
          </Link>
          <span aria-hidden="true">|</span>
          <Link to={ordersTo} className="transition hover:text-secondary">
            Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
