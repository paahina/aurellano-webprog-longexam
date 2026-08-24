import { Link } from "react-router-dom";
import ProductImage from "../ProductImage";
import { formatPeso } from "../../utils/format";

const OrderItemColumn = ({ item, linkable = true }) => {
  const slug = item.productSlug || item.productId?.productSlug;
  const image = item.productImage || item.productId?.productImage;
  const label = `${item.productName} × ${item.quantity} · ${formatPeso(item.productPrice)}`;

  const content = (
    <>
      <div className="overflow-hidden rounded-xl bg-zinc-200">
        <ProductImage
          src={image}
          alt={item.productName}
          className="aspect-square w-[7.5rem] object-cover"
          iconClassName="h-8 w-8"
        />
      </div>
      <p className="mt-2 max-w-[7.5rem] text-sm leading-snug text-zinc-700">{label}</p>
    </>
  );

  if (linkable && slug) {
    return (
      <Link
        to={`/shop/${slug}`}
        className="shrink-0 transition hover:opacity-90"
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  return <div className="shrink-0">{content}</div>;
};

export default OrderItemColumn;
