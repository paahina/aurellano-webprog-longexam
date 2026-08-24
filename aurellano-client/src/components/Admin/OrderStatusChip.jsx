const ORDER_CHIP = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "Ready for claiming",
    className: "bg-lime-100 text-lime-800",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
  },
};

const OrderStatusChip = ({ status }) => {
  const chip = ORDER_CHIP[status] || {
    label: status || "Unknown",
    className: "bg-zinc-100 text-zinc-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${chip.className}`}
    >
      {chip.label}
    </span>
  );
};

export default OrderStatusChip;
