import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useAdminTableQuery = (defaultSort, allowedSorts = []) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSort = searchParams.get("sort") || defaultSort;
  const sort = allowedSorts.includes(rawSort) ? rawSort : defaultSort;
  const search = searchParams.get("search") || "";

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
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

  return { sort, search, setSort, setSearch, updateParam };
};
