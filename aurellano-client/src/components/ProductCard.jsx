import Button from "./Button";
import ProductImage from "./ProductImage";
import { formatPeso } from "../utils/format";

const ProductCard = ({ product, index }) => {
  const description = product.productDescription || "";
  const preview =
    description.length > 120 ? `${description.substring(0, 120)}...` : description;

  return (
    <article className="rounded-3xl bg-zinc-100 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
      <div className="overflow-hidden rounded-[1.25rem] bg-zinc-200">
        <ProductImage
          src={product.productImage}
          alt={product.productName}
          className="aspect-4/3 h-full w-full rounded-[1.25rem] object-cover"
          iconClassName="h-12 w-12"
        />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
        {product.categoryId?.categoryName || `Product ${String(index + 1).padStart(2, "0")}`}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-primary">{product.productName}</h3>
      <p className="mt-2 text-base font-bold text-zinc-900">{formatPeso(product.productPrice)}</p>
      {preview ? <p className="mt-3 text-sm leading-6 text-zinc-600">{preview}</p> : null}
      <Button to={`/products/${product.productSlug}`} className="mt-4" variant="custom2">
        View Product
      </Button>
    </article>
  );
};

export default ProductCard;
