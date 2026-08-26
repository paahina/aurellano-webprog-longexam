import Button from "../Button";
import OrderStatusChip from "../Admin/OrderStatusChip";
import ActivityCard from "./ActivityCard";
import OrderItemColumn from "./OrderItemColumn";
import { formatDate, formatPeso } from "../../utils/format";

const OrderCard = ({ order, onCancel }) => {
  return (
    <ActivityCard>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <OrderStatusChip status={order.orderStatus} />
          {order.supplierId?.supplierName ? (
            <p className="mt-1 text-sm text-zinc-600">
              Supplier: {order.supplierId.supplierName}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-zinc-500">{formatDate(order.orderedAt)}</p>
      </div>

      <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
        {order.orderItems?.map((item, index) => (
          <OrderItemColumn
            key={`${order._id}-${item.productId}-${index}`}
            item={item}
          />
        ))}
      </div>

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
