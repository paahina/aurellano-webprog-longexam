import logo from "../assets/img/nubdexchange_logo.png";

const Footer = () => {
  return (
    <div className="border-t-4 border-secondary bg-primary px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-zinc-50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20">
            <img src={logo} alt="" />
          </div>
          <div>
            <p className="text-lg font-bold text-secondary">BulldogEx Shop</p>
            <p className="mt-1 text-sm text-zinc-300">
              Campus essentials, simple ordering.
            </p>
          </div>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
          Products | Cart | Pickup
        </p>
      </div>
    </div>
  );
};

export default Footer;
