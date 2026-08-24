import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Star } from "lucide-react";
import Button from "../../components/Button";
import ActivityCard from "../../components/Customer/ActivityCard";
import ListEmptyState from "../../components/Customer/ListEmptyState";
import ListSkeleton from "../../components/Customer/ListSkeleton";
import ReviewProductCard from "../../components/Customer/ReviewProductCard";
import { useAuth } from "../../context/AuthContext";
import { createReviewRequest, getOrdersRequest, getReviewsRequest } from "../../services/api";
import { formatDate, getId } from "../../utils/format";

const toLoadMessage = (err) => {
  const raw = err?.message || "";
  if (!raw || raw === "Failed to fetch") {
    return "Could not reach the server. Please try again later.";
  }
  return raw;
};

const assignReviewsToEntries = (entries, myReviews) => {
  const pools = {};
  myReviews.forEach((review) => {
    const productId = getId(review.productId);
    if (!productId) return;
    if (!pools[productId]) pools[productId] = [];
    pools[productId].push(review);
  });

  Object.values(pools).forEach((list) => {
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  });

  return entries.map((entry) => {
    const pool = pools[entry.productId] || [];
    const review = pool.shift() || null;
    return { ...entry, review };
  });
};

const ReviewPage = () => {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentProductId = searchParams.get("productId") || "";

  const [entries, setEntries] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState({
    productId: "",
    reviewRating: 5,
    reviewComment: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    setError("");
    setEntries([]);
    try {
      const [orders, reviewList] = await Promise.all([
        getOrdersRequest(token, { status: "delivered" }),
        getReviewsRequest(),
      ]);

      const delivered = [];
      orders.forEach((order) => {
        (order.orderItems || []).forEach((item, index) => {
          const productId = getId(item.productId);
          if (!productId) return;
          delivered.push({
            key: `${order._id}-${productId}-${index}`,
            productId,
            productName: item.productName || item.productId?.productName || "Product",
            productImage: item.productImage || item.productId?.productImage || "",
            productSlug: item.productSlug || item.productId?.productSlug || "",
            orderedAt: order.orderedAt,
          });
        });
      });

      delivered.sort((a, b) => new Date(b.orderedAt || 0) - new Date(a.orderedAt || 0));

      const myReviews = reviewList.filter((review) => getId(review.userId) === user._id);
      setEntries(assignReviewsToEntries(delivered, myReviews));
    } catch (err) {
      setEntries([]);
      setLoadError(toLoadMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, user._id]);

  const filteredEntries = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) return entries;
    return entries.filter((entry) => entry.productName.toLowerCase().includes(keyword));
  }, [entries, productSearch]);

  const selectedEntry = useMemo(
    () => filteredEntries.find((entry) => entry.key === selectedKey) || null,
    [filteredEntries, selectedKey]
  );

  useEffect(() => {
    if (!currentProductId || loading || loadError) return;
    const match = entries.find((entry) => entry.productId === currentProductId && !entry.review);
    if (match) {
      setSelectedKey(match.key);
      setForm({
        productId: match.productId,
        reviewRating: 5,
        reviewComment: "",
      });
    }
  }, [currentProductId, entries, loading, loadError]);

  useEffect(() => {
    if (selectedKey && !filteredEntries.some((entry) => entry.key === selectedKey)) {
      setSelectedKey(null);
    }
  }, [filteredEntries, selectedKey]);

  const hideForm = () => {
    setSelectedKey(null);
    setForm({ productId: "", reviewRating: 5, reviewComment: "" });
    setError("");
    setMessage("");
  };

  const openReviewForm = (entry) => {
    if (entry.review) return;
    setMessage("");
    setError("");
    setSelectedKey(entry.key);
    setForm({
      productId: entry.productId,
      reviewRating: 5,
      reviewComment: "",
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!form.productId) {
      setError("Select a delivered product to review.");
      return;
    }
    try {
      await createReviewRequest(
        {
          productId: form.productId,
          reviewRating: Number(form.reviewRating),
          reviewComment: form.reviewComment,
        },
        token
      );
      hideForm();
      setMessage("Review saved.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

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
      {!loading && !loadError && error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}

      {!loading && !loadError && entries.length ? (
        <label className="mt-4 block text-sm">
          Search delivered products
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search your delivered products"
              className="w-full rounded-xl border border-zinc-300 bg-white py-3 pr-4 pl-10"
            />
          </div>
        </label>
      ) : null}

      {loading ? <ListSkeleton variant="review" count={4} label="Loading reviews" /> : null}

      {!loading && loadError ? (
        <ListEmptyState icon={Star} title="Unable to load reviews" message={loadError} />
      ) : null}

      {!loading && !loadError && !entries.length ? (
        <ListEmptyState
          icon={Star}
          title="No products to review"
          message="No delivered orders yet. Reviews unlock after an order is delivered."
        />
      ) : null}

      {!loading && !loadError && entries.length && !filteredEntries.length ? (
        <ListEmptyState
          icon={Star}
          title="No Product found"
          message="No delivered products match that search."
        />
      ) : null}

      {!loading && !loadError && filteredEntries.length ? (
        <div className="mt-4">
          {selectedEntry ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <ActivityCard className="border-2 border-secondary">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-shade">
                  Writing review
                </p>
                <h3 className="mt-2 text-lg font-semibold text-primary">
                  {selectedEntry.productName}
                </h3>
                {selectedEntry.orderedAt ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    Delivered order · {formatDate(selectedEntry.orderedAt)}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-zinc-600">
                  Share a rating and optional comment for this product.
                </p>
              </ActivityCard>

              <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4">
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
                <label className="mt-4 block text-sm">
                  Comment
                  <textarea
                    value={form.reviewComment}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, reviewComment: event.target.value }))
                    }
                    className="mt-2 min-h-28 w-full rounded-xl border border-zinc-300 px-4 py-3"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="submit" variant="custom2">
                    Submit review
                  </Button>
                  <Button type="button" variant="custom5" onClick={hideForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          <div className={["space-y-3", selectedEntry ? "mt-4" : ""].filter(Boolean).join(" ")}>
            {filteredEntries.map((entry) => (
              <ReviewProductCard
                key={entry.key}
                entry={entry}
                selected={entry.key === selectedKey}
                onSelect={openReviewForm}
              />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ReviewPage;
