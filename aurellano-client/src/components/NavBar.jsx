import { NavLink } from "react-router-dom";
import Button from "./Button";
import logo from "../assets/img/nubdexchange_logo.png";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Products", to: "/products" },
];

const navLinkClassName = ({ isActive }) =>
  [
    "rounded-xl border-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition",
    isActive
      ? "border-secondary bg-secondary text-shade"
      : "border-transparent text-neutral1 hover:border-neutral1 hover:bg-neutral1 hover:text-shade",
  ].join(" ");

const NavBar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-primary backdrop-blur shadow-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="BulldogEx"
            className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-zinc-50 object-contain"
          />
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-secondary">BulldogEx Shop</p>
          </div>
        </NavLink>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={navLinkClassName}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Button to="/auth/signin">Sign Out</Button>
      </div>
    </header>
  );
};

export default NavBar;
