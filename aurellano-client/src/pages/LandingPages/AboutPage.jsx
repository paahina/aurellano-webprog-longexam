import Button from "../../components/Button";
import banner from "../../assets/img/nu_bulldogex_banner.jpg";

const AboutPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <section className="bg-transparent px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="rounded-3xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <img src={banner} alt="BulldogEx" className="object-cover" />
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-shade">
              About Store
            </p>
            <h1 className="max-w-xl text-3xl font-bold leading-tight text-primary sm:text-4xl">
              A campus shop focused on useful products and simple ordering.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-neutral1 sm:text-base">
              BulldogEx Shop keeps the low-fidelity layout system while
              presenting clear product categories, quick actions, and
              straightforward store information.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/" variant="custom2">
                Back Home
              </Button>
              <Button to="/products" variant="custom5">
                Open Products
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
            Quick store blocks
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-neutral1 p-5">
            <p className="text-2xl font-bold text-secondary-hover">08</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Items
            </p>
          </div>
          <div className="rounded-3xl bg-neutral1 p-5">
            <p className="text-2xl font-bold text-secondary-hover">06</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Categories
            </p>
          </div>
          <div className="rounded-3xl bg-neutral1 p-5">
            <p className="text-2xl font-bold text-secondary-hover">03</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Pickup Slots
            </p>
          </div>
          <div className="rounded-3xl bg-neutral1 p-5">
            <p className="text-2xl font-bold text-secondary-hover">24</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
              Orders
            </p>
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
              Store Flow
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral1">
              Stacked shopping wireframe
            </h2>

            <div className="mt-6 space-y-4">
              <article className="rounded-3xl bg-neutral1 p-5">
                <h3 className="text-lg font-semibold text-shade">
                  Curated Catalog
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Products are grouped by daily need so shoppers can scan
                  faster.
                </p>
              </article>

              <article className="rounded-3xl bg-neutral1 p-5">
                <h3 className="text-lg font-semibold text-shade">
                  Simple Checkout
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Product pages keep price, stock, and action buttons easy to
                  find.
                </p>
              </article>

              <article className="rounded-3xl bg-neutral1 p-5">
                <h3 className="text-lg font-semibold text-shade">
                  Pickup Ready
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  Store information stays direct for students who need quick
                  order updates.
                </p>
              </article>
            </div>
          </div>

          <div className="rounded-3xl bg-neutral1 p-5">
            <p className="text-5 font-bold uppercase tracking-[0.28em] text-shade">
              Category Grid
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-zinc-200 shadow-xl overflow-hidden">
                <img src="/assets/imgs/nu-nursing-lab-gown.jpg" alt="" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-zinc-200 shadow-xl overflow-hidden">
                <img src="/assets/imgs/nu-hoodie.jpg" alt="" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-zinc-200 shadow-xl overflow-hidden">
                <img src="/assets/imgs/nu-bulldog-plushie.png" alt="" />
              </div>
              <div className="flex aspect-square items-center justify-center rounded-[1.25rem] bg-zinc-200 shadow-xl overflow-hidden">
                <img src="/assets/imgs/nu-tumbler.jpg" alt="" />
              </div>
            </div>
            <Button to="/products" className="mt-5" variant="custom4">
              View Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
