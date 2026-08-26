import { Trash2 } from "lucide-react";
import Button from "../Button";
import ProductImage from "../ProductImage";
import ActivityCard from "./ActivityCard";
import { formatPeso, getId } from "../../utils/format";
import { getCartItemStockIssue } from "../../utils/stock";

const CartItemCard = ({
  item,
  selected = false,
  onSelectChange,
  selectDisabled = false,
  pending = false,
  onQuantityChange,
  onRemove,
}) => {
  const product = item.productId || {};
  const id = getId(product) || getId(item.productId);
  const stock = product.stockQuantity ?? 0;
  const { blocked, message } = getCartItemStockIssue(item);

  return (
    <ActivityCard
      className={[
        "flex flex-wrap items-center gap-4 transition-opacity",
        pending ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy={pending}
    >
      <label className="flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={selected}
          disabled={selectDisabled || blocked || pending}
          onChange={(event) => onSelectChange?.(id, event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-primary disabled:cursor-not-allowed"
          aria-label={`Select ${product.productName || "product"} for checkout`}
        />
      </label>
      <ProductImage
        src={product.productImage}
        alt={product.productName || ""}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
        iconClassName="h-6 w-6"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary">{product.productName || "Product"}</p>
        <p className="text-sm text-zinc-600">{formatPeso(product.productPrice)}</p>
        {blocked ? (
          <span className="mt-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            {message}
          </span>
        ) : null}
      </div>
      <input
        type="number"
        min="1"
        max={stock > 0 ? stock : 1}
        value={item.quantity}
        onChange={(event) => onQuantityChange(id, Number(event.target.value))}
        disabled={stock <= 0 || pending}
        className="w-20 rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
      />
      <Button type="button" variant="custom5" onClick={() => onRemove(id)} disabled={pending}>
        <span className="inline-flex items-center gap-2">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          Remove
        </span>
      </Button>
    </ActivityCard>
  );
};

export default CartItemCard;
