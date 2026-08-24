import Button from "../Button";
import ActivityCard from "./ActivityCard";
import { formatDate, formatPeso } from "../../utils/format";

const statusLabel = {
  pending: "Pending",
  confirmed: "Ready for claiming",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const OrderCard = ({ order, onCancel }) => {
  return (
    <ActivityCard>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-primary">
          {statusLabel[order.orderStatus] || order.orderStatus}
        </p>
        <p className="text-sm text-zinc-500">{formatDate(order.orderedAt)}</p>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-zinc-700">
        {order.orderItems?.map((item) => (
          <li key={`${order._id}-${item.productId}`}>
            {item.productName} × {item.quantity} · {formatPeso(item.productPrice)}
          </li>
        ))}
      </ul>
      <p className="mt-3 font-bold">Total: {formatPeso(order.totalAmount)}</p>
      {order.pickupDetails ? (
        <p className="mt-1 text-sm text-zinc-600">Pickup: {order.pickupDetails}</p>
      ) : null}
      {order.orderStatus === "pending" ? (
        <Button type="button" variant="custom5" className="mt-4" onClick={() => onCancel(order._id)}>
          Cancel order
        </Button>
      ) : null}
    </ActivityCard>
  );
};

export default OrderCard;
