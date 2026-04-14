import Button from "../components/Button";

const NotFoundPage = () => {
  return (
    <div className="flex w-full flex-col gap-6 bg-secondary h-screen ">
      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
            Error
          </p>
          <h1 className="text-6xl text-neutral1 font-bold leading-tight sm:text-7xl">
            404
          </h1>
          <p className="mt-4 text-lg leading-7 text-secondary">
            Page not found. The page you're looking for doesn't exist or has
            been moved.
          </p>
          <div className="mt-6 flex gap-3">
            <Button to="/" variant="custom1">
              Back Home
            </Button>
            <Button to="/products" variant="custom1">
              View Products
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
            Quick Links
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral1">
            Explore the site
          </h2>

          <div className="mt-6 space-y-3">
            <div className="rounded-3xl bg-secondary p-4">
              <h3 className="font-semibold text-primary">Home</h3>
              <p className="mt-1 text-sm text-shade">Return to the homepage</p>
              <Button to="/" className="mt-3">
                Go Home
              </Button>
            </div>

            <div className="bg-secondary rounded-3xl p-4">
              <h3 className="font-semibold text-primary">Products</h3>
              <p className="mt-1 text-sm text-shade">
                Browse all featured store items
              </p>
              <Button to="/products" className="mt-3">
                View Products
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;
