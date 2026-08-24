const AdminTableSkeleton = ({ rows = 6, columns = 5, label = "Loading" }) => (
  <div className="p-4" aria-busy="true" aria-label={label}>
    <div className="mb-4 flex gap-4 border-b border-zinc-100 pb-3">
      {Array.from({ length: columns }, (_, index) => (
        <div
          key={`head-${index}`}
          className="h-4 flex-1 animate-pulse rounded bg-zinc-200"
        />
      ))}
    </div>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div
        key={`row-${rowIndex}`}
        className="flex gap-4 border-b border-zinc-50 py-3 last:border-b-0"
      >
        {Array.from({ length: columns }, (_, colIndex) => (
          <div
            key={`cell-${rowIndex}-${colIndex}`}
            className="h-4 flex-1 animate-pulse rounded bg-zinc-100"
          />
        ))}
      </div>
    ))}
  </div>
);

export default AdminTableSkeleton;
