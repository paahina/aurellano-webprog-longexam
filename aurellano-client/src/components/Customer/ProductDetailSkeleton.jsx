const ProductDetailSkeleton = () => {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="h-10 w-40 animate-pulse rounded-xl bg-zinc-200" />

      <section className="animate-pulse rounded-3xl bg-primary p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="mx-auto aspect-square w-full max-w-xs shrink-0 rounded-[1.25rem] bg-white/20 md:mx-0 md:w-64 lg:w-72" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-3 w-28 rounded bg-white/20" />
            <div className="h-8 w-3/4 rounded bg-white/25" />
            <div className="h-6 w-24 rounded bg-white/20" />
            <div className="h-4 w-40 rounded bg-white/15" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-white/15" />
              <div className="h-3 w-full rounded bg-white/15" />
              <div className="h-3 w-2/3 rounded bg-white/15" />
            </div>
            <div className="mt-4 h-4 w-28 rounded bg-white/15" />
            <div className="mt-6 h-10 w-36 rounded-full bg-white/25" />
          </div>
        </div>
      </section>

      <section className="animate-pulse rounded-3xl bg-zinc-100 p-6">
        <div className="h-7 w-32 rounded bg-zinc-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={`detail-review-skeleton-${index}`} className="space-y-2 rounded-2xl bg-white p-4">
              <div className="h-4 w-48 rounded bg-zinc-200" />
              <div className="h-3 w-full rounded bg-zinc-200" />
              <div className="h-3 w-2/3 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailSkeleton;
