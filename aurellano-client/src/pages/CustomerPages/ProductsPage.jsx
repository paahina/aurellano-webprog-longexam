import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ShoppingCart,
} from "lucide-react";
import ListEmptyState from "../../components/Customer/ListEmptyState";
import ListSkeleton from "../../components/Customer/ListSkeleton";
import ShopProductCard from "../../components/Customer/ShopProductCard";
import { useAuth } from "../../context/AuthContext";
import { addToCartRequest, getCategoriesRequest, getProductsRequest, getReviewsRequest } from "../../services/api";
import { averageRating, getId } from "../../utils/format";

const PAGE_SIZE = 12;

const ProductsPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "az";
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [addedIds, setAddedIds] = useState({});
  const addedTimers = useRef({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      setProducts([]);
      try {
        const query = { limit: 100, search };
        if (category) query.category = category;
        if (sort === "az") query.sort = "name";
        if (sort === "za") query.sort = "-name";

        const [productList, categoryList, reviewList] = await Promise.all([
          getProductsRequest(query),
          getCategoriesRequest(),
          getReviewsRequest(),
        ]);
        if (cancelled) return;
        setProducts(productList);
        setCategories(categoryList);
        setReviews(reviewList);
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          const raw = err.message || "";
          setLoadError(
            !raw || raw === "Failed to fetch"
              ? "Could not reach the server. Please try again later."
              : raw
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [search, category, sort]);

  useEffect(() => {
    return () => {
      Object.values(addedTimers.current).forEach((timerId) => clearTimeout(timerId));
    };
  }, []);

  const reviewsByProduct = useMemo(() => {
    const map = {};
    reviews.forEach((review) => {
      const id = getId(review.productId);
      if (!map[id]) map[id] = [];
      map[id].push(review);
    });
    return map;
  }, [reviews]);

  const visibleProducts = useMemo(() => {
    if (sort !== "rating") return products;
    return [...products].sort((a, b) => {
      const ratingA = averageRating(reviewsByProduct[a._id] || []);
      const ratingB = averageRating(reviewsByProduct[b._id] || []);
      return ratingB - ratingA;
    });
  }, [products, reviewsByProduct, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visibleProducts.slice(start, start + PAGE_SIZE);
  }, [visibleProducts, currentPage]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const goToPage = (nextPage) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    const next = new URLSearchParams(searchParams);
    if (clamped <= 1) next.delete("page");
    else next.set("page", String(clamped));
    setSearchParams(next);
  };

  const showAddedCheck = (productId) => {
    if (addedTimers.current[productId]) {
      clearTimeout(addedTimers.current[productId]);
    }
    setAddedIds((prev) => ({ ...prev, [productId]: true }));
    addedTimers.current[productId] = setTimeout(() => {
      setAddedIds((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      delete addedTimers.current[productId];
    }, 3000);
  };

  const addToCart = async (event, productId) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await addToCartRequest(token, productId, 1);
      showAddedCheck(productId);
    } catch {
      // Keep feedback on-card only; failed adds simply show no check.
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-stretch lg:px-8">
      <aside className="flex w-full shrink-0 flex-col rounded-3xl bg-primary p-5 text-neutral1 lg:w-64 lg:self-stretch">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
          <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
          Categories
        </p>
        <div className="mt-4 grow space-y-2">
          <button
            type="button"
            onClick={() => updateParam("category", "")}
            className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
              !category ? "bg-secondary text-shade" : "hover:bg-white/10"
            }`}
          >
            All products
          </button>
          {categories.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => updateParam("category", item.categoryName)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                category === item.categoryName ? "bg-secondary text-shade" : "hover:bg-white/10"
              }`}
            >
              {item.categoryName}
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Customer shop
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
              <ShoppingCart className="h-7 w-7" strokeWidth={2} />
              Products
            </h1>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <ArrowUpDown className="h-4 w-4" strokeWidth={2} />
            Sort
            <select
              value={sort}
              onChange={(event) => updateParam("sort", event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="rating">Rating</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </label>
        </div>

        {loading ? (
          <ListSkeleton variant="shop" count={PAGE_SIZE} label="Loading products" />
        ) : null}

        {!loading && (loadError || !visibleProducts.length) ? (
          <ListEmptyState
            icon={ShoppingCart}
            title="No Product found"
            message={loadError || "No products match this search."}
            className="min-h-[28rem] py-16"
          />
        ) : null}

        {!loading && !loadError && visibleProducts.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagedProducts.map((product) => {
              const productReviews = reviewsByProduct[product._id] || [];
              return (
                <ShopProductCard
                  key={product._id}
                  product={product}
                  rating={averageRating(productReviews)}
                  reviewCount={productReviews.length}
                  justAdded={Boolean(addedIds[product._id])}
                  onAddToCart={addToCart}
                />
              );
            })}
          </div>
        ) : null}

        {!loading && !loadError && visibleProducts.length > PAGE_SIZE ? (
          <nav
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
            aria-label="Product pagination"
          >
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
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
                  onClick={() => goToPage(pageNumber)}
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 transition enabled:hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </nav>
        ) : null}
      </section>
    </div>
  );
};

export default ProductsPage;
