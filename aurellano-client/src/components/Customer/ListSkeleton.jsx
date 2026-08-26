const skeletonClass = "animate-pulse rounded-2xl bg-white p-4";

const CartSkeletonRow = () => (
  <div className={`flex flex-wrap items-center gap-4 ${skeletonClass}`}>
    <div className="h-4 w-4 shrink-0 rounded bg-zinc-200" />
    <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-200" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-40 rounded bg-zinc-200" />
      <div className="h-3 w-24 rounded bg-zinc-200" />
    </div>
    <div className="h-10 w-20 rounded-xl bg-zinc-200" />
    <div className="h-10 w-24 rounded-xl bg-zinc-200" />
  </div>
);

const CartSummarySkeleton = () => (
  <div className={`space-y-4 ${skeletonClass} border border-zinc-200 shadow-sm`}>
    <div className="h-5 w-32 rounded bg-zinc-200" />
    <div className="h-3 w-28 rounded bg-zinc-200" />
    <div className="space-y-2 border-b border-zinc-100 pb-4">
      <div className="flex justify-between gap-3">
        <div className="h-3 w-24 rounded bg-zinc-200" />
        <div className="h-3 w-16 rounded bg-zinc-200" />
      </div>
      <div className="flex justify-between gap-3">
        <div className="h-3 w-20 rounded bg-zinc-200" />
        <div className="h-3 w-16 rounded bg-zinc-200" />
      </div>
    </div>
    <div className="flex justify-between gap-3">
      <div className="h-5 w-14 rounded bg-zinc-200" />
      <div className="h-5 w-20 rounded bg-zinc-200" />
    </div>
    <div className="space-y-2">
      <div className="h-3 w-24 rounded bg-zinc-200" />
      <div className="h-12 w-full rounded-xl bg-zinc-200" />
    </div>
    <div className="h-11 w-full rounded-xl bg-zinc-200" />
  </div>
);

const CartLayoutSkeleton = ({ count = 4 }) => (
  <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_min(24rem,100%)] lg:items-start">
    <div>
      <div className="mb-3 flex gap-3">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }, (_, index) => (
          <CartSkeletonRow key={`cart-row-${index}`} />
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-2">
        <div className="h-10 w-16 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-16 animate-pulse rounded-xl bg-zinc-200" />
      </div>
    </div>
    <aside className="lg:sticky lg:top-4">
      <CartSummarySkeleton />
    </aside>
  </div>
);

const OrderSkeletonRow = () => (
  <div className={`space-y-3 ${skeletonClass}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="h-6 w-28 rounded-full bg-zinc-200" />
      <div className="h-3 w-28 rounded bg-zinc-200" />
    </div>
    <div className="flex gap-4 overflow-hidden">
      <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-200" />
      <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-200" />
    </div>
    <div className="h-4 w-32 rounded bg-zinc-200" />
    <div className="h-3 w-48 rounded bg-zinc-200" />
    <div className="h-10 w-28 rounded-xl bg-zinc-200" />
  </div>
);

const ReviewSkeletonRow = () => (
  <div className={`flex gap-4 ${skeletonClass}`}>
    <div className="h-24 w-24 shrink-0 rounded-xl bg-zinc-200 sm:h-28 sm:w-28" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-zinc-200" />
          <div className="h-3 w-28 rounded bg-zinc-200" />
        </div>
        <div className="h-6 w-24 rounded-full bg-zinc-200" />
      </div>
      <div className="h-3 w-2/3 rounded bg-zinc-200" />
    </div>
  </div>
);

const ReviewPanelSkeleton = () => (
  <div className={`space-y-4 ${skeletonClass} border border-zinc-200 shadow-sm`}>
    <div className="h-5 w-32 rounded bg-zinc-200" />
    <div className="h-3 w-full rounded bg-zinc-200" />
    <div className="space-y-2 border-t border-zinc-100 pt-4">
      <div className="h-3 w-24 rounded bg-zinc-200" />
      <div className="h-5 w-3/4 rounded bg-zinc-200" />
      <div className="h-3 w-40 rounded bg-zinc-200" />
    </div>
    <div className="space-y-2 border-t border-zinc-100 pt-4">
      <div className="h-3 w-full rounded bg-zinc-200" />
      <div className="h-12 w-full rounded-xl bg-zinc-200" />
      <div className="h-3 w-16 rounded bg-zinc-200" />
      <div className="h-28 w-full rounded-xl bg-zinc-200" />
      <div className="flex gap-2">
        <div className="h-10 w-32 rounded-xl bg-zinc-200" />
        <div className="h-10 w-24 rounded-xl bg-zinc-200" />
      </div>
    </div>
  </div>
);

const ReviewLayoutSkeleton = ({ count = 4 }) => (
  <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_min(24rem,100%)] lg:items-start">
    <div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-200" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }, (_, index) => (
          <ReviewSkeletonRow key={`review-row-${index}`} />
        ))}
      </div>
      <div className="mt-8 flex justify-center gap-2">
        <div className="h-10 w-16 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-10 w-16 animate-pulse rounded-xl bg-zinc-200" />
      </div>
    </div>
    <aside className="lg:sticky lg:top-4">
      <ReviewPanelSkeleton />
    </aside>
  </div>
);

const ShopSkeletonCard = () => (
  <div className="animate-pulse rounded-3xl bg-zinc-100 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.12)]">
    <div className="aspect-4/3 rounded-[1.25rem] bg-zinc-200" />
    <div className="mt-4 h-3 w-24 rounded bg-zinc-200" />
    <div className="mt-3 h-5 w-3/4 rounded bg-zinc-200" />
    <div className="mt-3 h-4 w-20 rounded bg-zinc-200" />
    <div className="mt-2 h-3 w-32 rounded bg-zinc-200" />
    <div className="mt-4 flex items-center gap-2">
      <div className="h-10 w-10 rounded-full bg-zinc-200" />
      <div className="h-10 w-10 rounded-full bg-zinc-200" />
    </div>
  </div>
);

const layoutVariants = {
  cart: CartLayoutSkeleton,
  review: ReviewLayoutSkeleton,
};

const rowVariants = {
  order: OrderSkeletonRow,
  shop: ShopSkeletonCard,
};

const ListSkeleton = ({ variant = "cart", count = 3, className = "", label = "Loading" }) => {
  const Layout = layoutVariants[variant];
  if (Layout) {
    return (
      <div aria-busy="true" aria-label={label}>
        <Layout count={count} />
      </div>
    );
  }

  const Row = rowVariants[variant] || CartSkeletonRow;
  const isShop = variant === "shop";

  return (
    <div
      className={
        className ||
        (isShop
          ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          : variant === "order"
            ? "mt-4 space-y-4"
            : "mt-4 space-y-3")
      }
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <Row key={`${variant}-skeleton-${index}`} />
      ))}
    </div>
  );
};

export default ListSkeleton;
