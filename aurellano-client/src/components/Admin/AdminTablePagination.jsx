import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminTablePagination = ({ page, totalPages, onPageChange, label = "Table pagination" }) => {
  if (totalPages <= 1) return null;

  const currentPage = Math.min(page, totalPages);

  return (
    <nav
      className="mt-4 flex flex-wrap items-center justify-center gap-2 px-4 pb-4"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 transition enabled:hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;
        const isActive = pageNumber === currentPage;
        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition",
              isActive
                ? "bg-primary text-secondary"
                : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 transition enabled:hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </nav>
  );
};

export default AdminTablePagination;
