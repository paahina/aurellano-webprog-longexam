import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useAdminTableQuery = (defaultSort, allowedSorts = []) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSort = searchParams.get("sort") || defaultSort;
  const sort = allowedSorts.includes(rawSort) ? rawSort : defaultSort;
  const search = searchParams.get("search") || "";
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const updateParam = useCallback(
    (key, value, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      if (resetPage && key !== "page") next.delete("page");
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const setSort = useCallback(
    (value) => {
      updateParam("sort", value === defaultSort ? "" : value);
    },
    [defaultSort, updateParam]
  );

  const setSearch = useCallback(
    (value) => {
      updateParam("search", value.trim());
    },
    [updateParam]
  );

  const setPage = useCallback(
    (nextPage) => {
      const clamped = Math.max(1, Number(nextPage) || 1);
      const next = new URLSearchParams(searchParams);
      if (clamped <= 1) next.delete("page");
      else next.set("page", String(clamped));
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  return { sort, search, page, setSort, setSearch, setPage, updateParam };
};
