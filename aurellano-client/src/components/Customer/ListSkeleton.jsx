const skeletonClass = "animate-pulse rounded-2xl bg-white p-4";

const CartSkeletonRow = () => (
  <div className={`flex flex-wrap items-center gap-4 ${skeletonClass}`}>
    <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-200" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-40 rounded bg-zinc-200" />
      <div className="h-3 w-24 rounded bg-zinc-200" />
    </div>
    <div className="h-10 w-20 rounded-xl bg-zinc-200" />
    <div className="h-10 w-24 rounded-xl bg-zinc-200" />
  </div>
);

const OrderSkeletonRow = () => (
  <div className={`space-y-3 ${skeletonClass}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="h-4 w-36 rounded bg-zinc-200" />
      <div className="h-3 w-28 rounded bg-zinc-200" />
    </div>
    <div className="h-3 w-full rounded bg-zinc-200" />
    <div className="h-3 w-2/3 rounded bg-zinc-200" />
    <div className="h-4 w-32 rounded bg-zinc-200" />
    <div className="h-10 w-28 rounded-xl bg-zinc-200" />
  </div>
);

const ReviewSkeletonRow = () => (
  <div className={`space-y-2 ${skeletonClass}`}>
    <div className="h-4 w-48 rounded bg-zinc-200" />
    <div className="h-3 w-32 rounded bg-zinc-200" />
    <div className="h-3 w-2/3 rounded bg-zinc-200" />
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

const variants = {
  cart: CartSkeletonRow,
  order: OrderSkeletonRow,
  review: ReviewSkeletonRow,
  shop: ShopSkeletonCard,
};

const ListSkeleton = ({ variant = "cart", count = 3, className = "", label = "Loading" }) => {
  const Row = variants[variant] || CartSkeletonRow;
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
