import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Button from "../../components/Button";
import CartItemCard from "../../components/Customer/CartItemCard";
import ListEmptyState from "../../components/Customer/ListEmptyState";
import ListPagination from "../../components/Customer/ListPagination";
import ListSkeleton from "../../components/Customer/ListSkeleton";
import { useAuth } from "../../context/AuthContext";
import {
  createOrderRequest,
  getCartItemsPagedRequest,
  getCartsRequest,
  saveCartItemsRequest,
} from "../../services/api";
import { formatPeso, getId } from "../../utils/format";
import { getCartItemStockIssue } from "../../utils/stock";

const PAGE_SIZE = 10;

const toLoadMessage = (err) => {
  const raw = err?.message || "";
  if (!raw || raw === "Failed to fetch") {
    return "Could not reach the server. Please try again later.";
  }
  return raw;
};

const getItemProductId = (item) => getId(item.productId);

const isSelectableItem = (item) => !getCartItemStockIssue(item).blocked;

const slicePageItems = (allItems, page) => {
  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;
  return {
    items: allItems.slice(skip, skip + PAGE_SIZE),
    total,
    totalPages,
    page: safePage,
  };
};

const CartPage = () => {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const [items, setItems] = useState([]);
  const [fullCartItems, setFullCartItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [totalPages, setTotalPages] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const [pickupDetails, setPickupDetails] = useState("NU Manila Bulldogs Exchange");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const knownCartIdsRef = useRef(new Set());
  const hasLoadedRef = useRef(false);
  const skipPageLoadRef = useRef(false);
  const fullCartRef = useRef([]);

  const setPage = (nextPage) => {
    const clamped = Math.max(1, Number(nextPage) || 1);
    const next = new URLSearchParams(searchParams);
    if (clamped <= 1) next.delete("page");
    else next.set("page", String(clamped));
    setSearchParams(next);
  };

  const syncSelection = (allItems) => {
    setSelectedIds((prev) => {
      const next = new Set();
      allItems.forEach((item) => {
        const id = getItemProductId(item);
        if (!id || !isSelectableItem(item)) return;
        const isNew = !knownCartIdsRef.current.has(id);
        if (isNew || prev.has(id)) next.add(id);
      });
      knownCartIdsRef.current = new Set(
        allItems.map(getItemProductId).filter(Boolean)
      );
      return next;
    });
  };

  const applyCartState = (allItems, currentPage = page) => {
    const paged = slicePageItems(allItems, currentPage);
    setFullCartItems(allItems);
    fullCartRef.current = allItems;
    setItems(paged.items);
    setItemCount(paged.total);
    setTotalPages(paged.totalPages);
    knownCartIdsRef.current = new Set(allItems.map(getItemProductId).filter(Boolean));
    if (paged.page !== currentPage) {
      skipPageLoadRef.current = true;
      setPage(paged.page);
    }
  };

  const loadCart = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (!silent) setLoadError("");
    try {
      const [paged, carts] = await Promise.all([
        getCartItemsPagedRequest(token, { page, limit: PAGE_SIZE }),
        getCartsRequest(token),
      ]);
      const allItems = carts[0]?.cartItems || [];
      setFullCartItems(allItems);
      fullCartRef.current = allItems;
      setItems(paged.items);
      syncSelection(allItems);
      setTotalPages(paged.totalPages);
      setItemCount(paged.total);
      hasLoadedRef.current = true;
    } catch (err) {
      if (!silent) {
        setItems([]);
        setFullCartItems([]);
        setSelectedIds(new Set());
        knownCartIdsRef.current = new Set();
        setTotalPages(1);
        setItemCount(0);
        setLoadError(toLoadMessage(err));
      } else {
        setError(err.message || toLoadMessage(err));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    hasLoadedRef.current = false;
  }, [token]);

  useEffect(() => {
    if (skipPageLoadRef.current) {
      skipPageLoadRef.current = false;
      return;
    }
    loadCart({ silent: hasLoadedRef.current });
  }, [token, page]);

  useEffect(() => {
    if (loading || page <= totalPages) return;
    setPage(totalPages);
  }, [loading, page, totalPages]);

  const selectableItems = useMemo(
    () => fullCartItems.filter(isSelectableItem),
    [fullCartItems]
  );

  const selectedItems = useMemo(
    () => fullCartItems.filter((item) => selectedIds.has(getItemProductId(item))),
    [fullCartItems, selectedIds]
  );

  const supplierTotals = useMemo(() => {
    const groups = new Map();
    selectedItems.forEach((item) => {
      const supplier = item.productId?.supplierId;
      const key = getId(supplier) || supplier?.supplierName || "supplier";
      const name = supplier?.supplierName || "Supplier";
      const lineTotal = (item.productId?.productPrice || 0) * (item.quantity || 0);
      const existing = groups.get(key) || { name, total: 0 };
      existing.total += lineTotal;
      groups.set(key, existing);
    });
    return Array.from(groups.values());
  }, [selectedItems]);

  const selectedTotal = useMemo(
    () => supplierTotals.reduce((sum, group) => sum + group.total, 0),
    [supplierTotals]
  );

  const selectedBlocked = useMemo(
    () => selectedItems.some((item) => getCartItemStockIssue(item).blocked),
    [selectedItems]
  );

  const allSelectableSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedIds.has(getItemProductId(item)));

  const toggleItemSelection = (productId, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(selectableItems.map(getItemProductId).filter(Boolean)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const setProductPending = (productId, pending) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const persistCartInBackground = (nextItems, snapshot) => {
    saveCartItemsRequest(token, nextItems)
      .then(() => {
        setProductPending(snapshot.productId, false);
      })
      .catch((err) => {
        applyCartState(snapshot.full, snapshot.page);
        setSelectedIds(snapshot.selected);
        setProductPending(snapshot.productId, false);
        setError(err.message);
      });
  };

  const mutateFullCart = (updater, productId) => {
    setError("");
    const snapshot = {
      full: fullCartRef.current,
      selected: new Set(selectedIds),
      page,
      productId,
    };
    const nextItems = updater([...fullCartRef.current]);
    applyCartState(nextItems);
    if (productId) setProductPending(productId, true);
    persistCartInBackground(nextItems, snapshot);
  };

  const updateQuantity = (productId, quantity) => {
    mutateFullCart(
      (allItems) =>
        allItems
          .map((item) =>
            getId(item.productId) === productId ? { ...item, quantity } : item
          )
          .filter((item) => item.quantity > 0),
      productId
    );
  };

  const removeItem = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    mutateFullCart(
      (allItems) => allItems.filter((item) => getId(item.productId) !== productId),
      productId
    );
  };

  const checkout = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!selectedItems.length) {
      setError("Select at least one item to place your order.");
      return;
    }
    if (selectedBlocked) {
      setError("Uncheck out-of-stock items or adjust quantities before placing your order.");
      return;
    }
    setCheckingOut(true);
    try {
      const orderItems = selectedItems.map((item) => ({
        productId: getId(item.productId),
        productName: item.productId?.productName || "Product",
        productPrice: item.productId?.productPrice || 0,
        quantity: item.quantity,
      }));
      const remaining = fullCartItems.filter(
        (item) => !selectedIds.has(getItemProductId(item))
      );
      const orders = await createOrderRequest({ orderItems, pickupDetails }, token);
      await saveCartItemsRequest(token, remaining);
      setSelectedIds(new Set());
      applyCartState(remaining);
      setMessage(
        orders.length > 1
          ? `Order placed (${orders.length} orders). Track them in the Orders tab.`
          : "Order placed. Track it in the Orders tab."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  const showCart = !loading && !loadError && itemCount > 0;

  return (
    <section className="rounded-3xl bg-zinc-100 p-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold text-primary">
        <ShoppingCart className="h-6 w-6" strokeWidth={2} />
        Cart
      </h2>
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}
      {!loading && !loadError && error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? <ListSkeleton variant="cart" count={4} label="Loading cart" /> : null}

      {!loading && (loadError || !itemCount) ? (
        <ListEmptyState
          icon={ShoppingCart}
          title={loadError ? "Unable to load cart" : "Cart is empty"}
          message={loadError || "Your cart is empty."}
        />
      ) : null}

      {showCart ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_min(24rem,100%)] lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={allSelectableSelected}
                  onChange={(event) => (event.target.checked ? selectAll() : deselectAll())}
                  className="h-4 w-4 rounded border-zinc-300 text-primary"
                />
                Select all
              </label>
              <button
                type="button"
                onClick={deselectAll}
                className="text-zinc-600 underline-offset-2 hover:text-primary hover:underline"
              >
                Deselect all
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const id = getItemProductId(item) || item._id;
                return (
                  <CartItemCard
                    key={id}
                    item={item}
                    selected={selectedIds.has(id)}
                    onSelectChange={toggleItemSelection}
                    selectDisabled={!isSelectableItem(item)}
                    pending={pendingIds.has(id)}
                    onQuantityChange={updateQuantity}
                    onRemove={removeItem}
                  />
                );
              })}
            </div>

            <ListPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              label="Cart pagination"
            />
          </div>

          <aside className="lg:sticky lg:top-4">
            <form
              onSubmit={checkout}
              className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-primary">Order summary</h3>
              <p className="text-sm text-zinc-600">
                Selected: {selectedItems.length}{" "}
                {selectedItems.length === 1 ? "item" : "items"}
              </p>

              {supplierTotals.length ? (
                <ul className="space-y-2 border-b border-zinc-100 pb-4 text-sm">
                  {supplierTotals.map((group) => (
                    <li key={group.name} className="flex items-center justify-between gap-3">
                      <span className="text-zinc-700">{group.name}</span>
                      <span className="font-medium text-primary">{formatPeso(group.total)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <p className="flex items-center justify-between text-lg font-bold text-primary">
                <span>Total</span>
                <span>{formatPeso(selectedTotal)}</span>
              </p>

              {selectedBlocked ? (
                <p className="text-sm text-red-700">
                  A selected item is out of stock or exceeds available quantity.
                </p>
              ) : null}

              <label className="block text-sm">
                Pickup details
                <input
                  value={pickupDetails}
                  onChange={(event) => setPickupDetails(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
                />
              </label>
              <Button
                type="submit"
                variant="custom2"
                disabled={!selectedItems.length || selectedBlocked || checkingOut}
              >
                {checkingOut ? "Placing order..." : "Place order"}
              </Button>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
};

export default CartPage;
