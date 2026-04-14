import Button from "../../components/Button";
import banner from "../../assets/img/nu_bulldogex_banner.jpg";

const HomePage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="relative min-h-112 overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <img
          src={banner}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-zinc-900/45" />

        <div className="relative z-10 flex min-h-88 items-start justify-end text-right sm:min-h-96">
          <div className="max-w-xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-200">
              Campus Marketplace
            </p>
            <h1 className="text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
              Welcome to BulldogEx Shop
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-100 sm:text-base">
              Explore campus uniforms, student essentials, and school merch in
              one quick storefront.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button to="/products" variant="custom2">
                Shop Now
              </Button>
              <Button to="/about" variant="custom3">
                About Store
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
            Store Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral1">
            Quick shopping blocks
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-neutral1 p-5 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <p className="text-2xl font-bold text-secondary-hover">08</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Products
            </p>
          </div>
          <div className="rounded-3xl bg-neutral1 p-5 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <p className="text-2xl font-bold text-secondary-hover">06</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Categories
            </p>
          </div>
          <div className="rounded-3xl bg-neutral1 p-5 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <p className="text-2xl font-bold text-secondary-hover">24</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Orders
            </p>
          </div>
          <div className="rounded-3xl bg-neutral1 p-5 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <p className="text-2xl font-bold text-secondary-hover">03</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Pickup Slots
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
            Shop Sections
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral1">
            Simple store cards
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-zinc-100 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <div className="flex aspect-4/3 items-center justify-center rounded-[1.25rem] bg-zinc-200 overflow-hidden shadow-xl">
              <img src="/assets/imgs/nu-tumbler.jpg" alt="" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-shade">
              Daily Essentials
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Bags, tumblers, lanyards, and items used every school day.
            </p>
            <Button to="/products" className="mt-4" variant="custom4">
              View Products
            </Button>
          </article>

          <article className="rounded-3xl bg-zinc-100 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <div className="flex aspect-4/3 items-center justify-center rounded-[1.25rem] bg-zinc-200 overflow-hidden shadow-xl">
              <img src="/assets/imgs/nu-stickers.jpg" alt="" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-shade">
              Study Supplies
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Notes, desk tools, and study kits for class and review weeks.
            </p>
            <Button to="/products" className="mt-4" variant="custom4">
              Shop Supplies
            </Button>
          </article>

          <article className="rounded-3xl bg-zinc-100 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <div className="flex aspect-4/3 items-center justify-center rounded-[1.25rem] bg-zinc-200 overflow-hidden shadow-xl">
              <img src="/assets/imgs/nu-lanyards.jpg" alt="" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-shade">
              Campus Apparel
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Comfortable pieces for class days, commute days, and weekends.
            </p>
            <Button to="/products" className="mt-4" variant="custom4">
              View Apparel
            </Button>
          </article>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
