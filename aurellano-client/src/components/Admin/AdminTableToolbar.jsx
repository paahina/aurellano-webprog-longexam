import { ArrowUpDown, Search } from "lucide-react";

const AdminTableToolbar = ({
  sort,
  onSortChange,
  sortOptions,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
}) => (
  <div className="mt-4 flex flex-wrap items-center gap-4">
    <label className="flex items-center gap-2 text-sm text-zinc-600">
      <ArrowUpDown className="h-4 w-4" strokeWidth={2} />
      Sort
      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value)}
        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    {onSearchChange ? (
      <label className="flex min-w-[14rem] flex-1 items-center gap-2 text-sm text-zinc-600 sm:max-w-xs">
        <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none"
        />
      </label>
    ) : null}
  </div>
);

export const PRODUCT_SORT_OPTIONS = [
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
  { value: "newest", label: "Newest → Oldest" },
  { value: "oldest", label: "Oldest → Newest" },
  { value: "priceAsc", label: "Price: low → high" },
  { value: "priceDesc", label: "Price: high → low" },
  { value: "rating", label: "Rating" },
];

export const GENERIC_SORT_OPTIONS = [
  { value: "az", label: "A–Z" },
  { value: "za", label: "Z–A" },
  { value: "newest", label: "Newest → Oldest" },
  { value: "oldest", label: "Oldest → Newest" },
];

export const DATE_SORT_OPTIONS = [
  { value: "newest", label: "Newest → Oldest" },
  { value: "oldest", label: "Oldest → Newest" },
];

export const productSortToQuery = (sort) =>
  ({
    az: "name",
    za: "-name",
    newest: "-createdAt",
    oldest: "createdAt",
    priceAsc: "price",
    priceDesc: "-price",
    rating: "-rating",
  })[sort] || "name";

export const genericSortToQuery = (sort) =>
  ({
    az: "name",
    za: "-name",
    newest: "-createdAt",
    oldest: "createdAt",
  })[sort] || "name";

export const dateSortToQuery = (sort) =>
  ({
    newest: "-createdAt",
    oldest: "createdAt",
  })[sort] || "-createdAt";

export default AdminTableToolbar;
