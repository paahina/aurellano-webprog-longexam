import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Star } from "lucide-react";
import Button from "../../components/Button";
import ListEmptyState from "../../components/Customer/ListEmptyState";
import ListPagination from "../../components/Customer/ListPagination";
import ListSkeleton from "../../components/Customer/ListSkeleton";
import ReviewProductCard from "../../components/Customer/ReviewProductCard";
import { useAuth } from "../../context/AuthContext";
import { createReviewRequest, getReviewablePagedRequest } from "../../services/api";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 10;

const toLoadMessage = (err) => {
  const raw = err?.message || "";
  if (!raw || raw === "Failed to fetch") {
    return "Could not reach the server. Please try again later.";
  }
  return raw;
};

const ReviewPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentProductId = searchParams.get("productId") || "";
  const search = searchParams.get("search") || "";
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const [entries, setEntries] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [searchInput, setSearchInput] = useState(search);
  const [activeEntry, setActiveEntry] = useState(null);
  const [form, setForm] = useState({
    productId: "",
    reviewRating: 5,
    reviewComment: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next);
  };

  const setPage = (nextPage) => {
    const clamped = Math.max(1, Number(nextPage) || 1);
    updateParams({
      page: clamped <= 1 ? "" : String(clamped),
      search: search || "",
      productId: currentProductId || "",
    });
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === search) return;
      updateParams({
        search: trimmed,
        page: "",
        productId: currentProductId || "",
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const query = { page, limit: PAGE_SIZE };
      if (search) query.search = search;
      const data = await getReviewablePagedRequest(token, query);
      setEntries(data.items);
      setTotalPages(data.totalPages);
      setTotalEntries(data.total);
    } catch (err) {
      setEntries([]);
      setTotalPages(1);
      setTotalEntries(0);
      setLoadError(toLoadMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, page, search]);

  useEffect(() => {
    if (loading || page <= totalPages) return;
    setPage(totalPages);
  }, [loading, page, totalPages]);

  const clearSelection = () => {
    setActiveEntry(null);
    setForm({ productId: "", reviewRating: 5, reviewComment: "" });
    setError("");
  };

  const selectEntry = (entry) => {
    setMessage("");
    setError("");
    setActiveEntry(entry);
    if (!entry.review) {
      setForm({
        productId: entry.productId,
        reviewRating: 5,
        reviewComment: "",
      });
    }
  };

  useEffect(() => {
    if (!activeEntry) return;
    const refreshed = entries.find((entry) => entry.key === activeEntry.key);
    if (refreshed) setActiveEntry(refreshed);
  }, [entries]);

  useEffect(() => {
    if (!currentProductId || loading || loadError) return;
    const match = entries.find((entry) => entry.productId === currentProductId && !entry.review);
    if (match) selectEntry(match);
  }, [currentProductId, entries, loading, loadError]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!form.productId) {
      setError("Select a delivered product to review.");
      return;
    }
    setSaving(true);
    try {
      await createReviewRequest(
        {
          productId: form.productId,
          reviewRating: Number(form.reviewRating),
          reviewComment: form.reviewComment,
        },
        token
      );
      clearSelection();
      setMessage("Review saved.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const hasSearch = Boolean(search);
  const showSearch = !loading && !loadError && (totalEntries > 0 || hasSearch);
  const showGrid = !loading && !loadError && entries.length;

  return (
    <section className="rounded-3xl bg-zinc-100 p-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold text-primary">
        <Star className="h-6 w-6" strokeWidth={2} />
        Reviews
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        Only products from your delivered orders can be reviewed.
      </p>

      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}

      {loading ? <ListSkeleton variant="review" count={4} label="Loading reviews" /> : null}

      {!loading && loadError ? (
        <ListEmptyState icon={Star} title="Unable to load reviews" message={loadError} />
      ) : null}

      {!loading && !loadError && !totalEntries && !search ? (
        <ListEmptyState
          icon={Star}
          title="No products to review"
          message="No delivered orders yet. Reviews unlock after an order is delivered."
        />
      ) : null}

      {!loading && !loadError && !totalEntries && search ? (
        <ListEmptyState
          icon={Star}
          title="No Product found"
          message="No delivered products match that search."
        />
      ) : null}

      {showGrid ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_min(24rem,100%)] lg:items-start">
          <div>
            {showSearch ? (
              <label className="mb-4 block text-sm">
                Search delivered products
                <div className="relative mt-2">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search your delivered products"
                    className="w-full rounded-xl border border-zinc-300 bg-white py-3 pr-4 pl-10"
                  />
                </div>
              </label>
            ) : null}

            <div className="space-y-3">
              {entries.map((entry) => (
                <ReviewProductCard
                  key={entry.key}
                  entry={entry}
                  selected={entry.key === activeEntry?.key}
                  onSelect={selectEntry}
                />
              ))}
            </div>

            <ListPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Reviews pagination"
            />
          </div>

          <aside className="lg:sticky lg:top-4">
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-primary">Write a review</h3>

              {!activeEntry ? (
                <p className="text-sm text-zinc-600">
                  Select a delivered product from the list to write or view a review.
                </p>
              ) : (
                <>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-shade">
                      {activeEntry.review ? "Your review" : "Writing review"}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-primary">
                      {activeEntry.productName}
                    </h4>
                    {activeEntry.orderedAt ? (
                      <p className="mt-1 text-sm text-zinc-500">
                        Delivered order · {formatDate(activeEntry.orderedAt)}
                      </p>
                    ) : null}
                  </div>

                  {activeEntry.review ? (
                    <div className="space-y-3 border-t border-zinc-100 pt-4">
                      <p className="flex items-center gap-1 text-sm font-medium text-shade">
                        <Star
                          className="h-4 w-4 fill-secondary text-secondary"
                          strokeWidth={2}
                        />
                        {activeEntry.review.reviewRating}/5
                      </p>
                      <p className="text-sm text-zinc-700">
                        {activeEntry.review.reviewComment || "No comment"}
                      </p>
                      <Button type="button" variant="custom5" onClick={clearSelection}>
                        Close
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} className="space-y-4 border-t border-zinc-100 pt-4">
                      {error ? <p className="text-sm text-red-700">{error}</p> : null}
                      <p className="text-sm text-zinc-600">
                        Share a rating and optional comment for this product.
                      </p>
                      <label className="block text-sm">
                        Rating
                        <select
                          value={form.reviewRating}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, reviewRating: event.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block text-sm">
                        Comment
                        <textarea
                          value={form.reviewComment}
                          onChange={(event) =>
                            setForm((prev) => ({ ...prev, reviewComment: event.target.value }))
                          }
                          className="mt-2 min-h-28 w-full rounded-xl border border-zinc-300 px-4 py-3"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" variant="custom2" disabled={saving}>
                          {saving ? "Saving..." : "Submit review"}
                        </Button>
                        <Button type="button" variant="custom5" onClick={clearSelection}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
};

export default ReviewPage;
