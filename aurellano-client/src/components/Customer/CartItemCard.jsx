import { Trash2 } from "lucide-react";
import Button from "../Button";
import ProductImage from "../ProductImage";
import ActivityCard from "./ActivityCard";
import { formatPeso, getId } from "../../utils/format";

const CartItemCard = ({ item, onQuantityChange, onRemove }) => {
  const product = item.productId || {};
  const id = getId(product) || getId(item.productId);

  return (
    <ActivityCard className="flex flex-wrap items-center gap-4">
      <ProductImage
        src={product.productImage}
        alt={product.productName || ""}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
        iconClassName="h-6 w-6"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary">{product.productName || "Product"}</p>
        <p className="text-sm text-zinc-600">{formatPeso(product.productPrice)}</p>
      </div>
      <input
        type="number"
        min="1"
        value={item.quantity}
        onChange={(event) => onQuantityChange(id, Number(event.target.value))}
        className="w-20 rounded-xl border border-zinc-300 px-3 py-2 text-sm"
      />
      <Button type="button" variant="custom5" onClick={() => onRemove(id)}>
        <span className="inline-flex items-center gap-2">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          Remove
        </span>
      </Button>
    </ActivityCard>
  );
};

export default CartItemCard;
