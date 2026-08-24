import { Link } from "react-router-dom";
import { Check, Plus, ShoppingCart, Star } from "lucide-react";
import ProductImage from "../ProductImage";
import { formatPeso } from "../../utils/format";

const ShopProductCard = ({
  product,
  rating = 0,
  reviewCount = 0,
  justAdded = false,
  onAddToCart,
}) => {
  const outOfStock = (product.stockQuantity ?? 0) <= 0;

  return (
    <Link
      to={`/shop/${product.productSlug}`}
      className="block rounded-3xl border border-zinc-200 bg-zinc-100 p-4 transition hover:bg-zinc-50"
    >
      <div className="overflow-hidden rounded-[1.25rem] bg-zinc-200">
        <ProductImage
          src={product.productImage}
          alt={product.productName}
          className="aspect-4/3 h-full w-full object-cover"
          iconClassName="h-12 w-12"
        />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
        {product.categoryId?.categoryName || "Product"}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-primary">{product.productName}</h2>
      <p className="mt-2 text-base font-bold">{formatPeso(product.productPrice)}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-zinc-600">
        <Star className="h-3.5 w-3.5 fill-secondary text-secondary" strokeWidth={2} />
        {rating
          ? `${rating.toFixed(1)} / 5 · ${reviewCount} reviews`
          : "No reviews yet"}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => onAddToCart?.(event, product._id)}
          title={outOfStock ? "Out of stock" : "Add to cart"}
          aria-label={`Add ${product.productName} to cart`}
          disabled={outOfStock}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-secondary transition hover:bg-shade disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-5 w-5" strokeWidth={2} />
          <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-shade">
            <Plus className="h-3 w-3" strokeWidth={3} />
          </span>
        </button>

        {outOfStock ? (
          <span className="text-xs font-semibold text-red-700">Out of stock</span>
        ) : null}

        <span
          className={[
            "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
            justAdded
              ? "border-green-600 bg-green-50 text-green-700"
              : "border-transparent text-transparent",
          ].join(" ")}
          aria-hidden={!justAdded}
        >
          {justAdded ? <Check className="h-5 w-5" strokeWidth={2.5} /> : null}
        </span>
      </div>
    </Link>
  );
};

export default ShopProductCard;
