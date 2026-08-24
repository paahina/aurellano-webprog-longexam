const STOCK_CHIP = {
  in_stock: {
    label: "In stock",
    className: "bg-green-100 text-green-800",
  },
  low_stock: {
    label: "Low stock",
    className: "bg-yellow-100 text-yellow-800",
  },
  out_of_stock: {
    label: "Out of stock",
    className: "bg-red-100 text-red-700",
  },
};

const StockStatusChip = ({ status }) => {
  const chip = STOCK_CHIP[status] || {
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

export default StockStatusChip;
