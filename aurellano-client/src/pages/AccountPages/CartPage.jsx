import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Button from "../../components/Button";
import CartItemCard from "../../components/Customer/CartItemCard";
import ListEmptyState from "../../components/Customer/ListEmptyState";
import ListSkeleton from "../../components/Customer/ListSkeleton";
import { useAuth } from "../../context/AuthContext";
import { createOrderRequest, getCartsRequest, saveCartItemsRequest } from "../../services/api";
import { formatPeso, getId } from "../../utils/format";

const toLoadMessage = (err) => {
  const raw = err?.message || "";
  if (!raw || raw === "Failed to fetch") {
    return "Could not reach the server. Please try again later.";
  }
  return raw;
};

const CartPage = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [pickupDetails, setPickupDetails] = useState("NU Manila Bulldogs Exchange");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadCart = async () => {
      setLoading(true);
      setLoadError("");
      setError("");
      setItems([]);
      try {
        const carts = await getCartsRequest(token);
        if (cancelled) return;
        const current = carts[0] || null;
        setItems(current?.cartItems || []);
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setLoadError(toLoadMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadCart();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persist = async (nextItems) => {
    const previous = items;
    setItems(nextItems);
    setError("");
    try {
      await saveCartItemsRequest(token, nextItems);
    } catch (err) {
      setItems(previous);
      setError(err.message);
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const next = items
      .map((item) =>
        getId(item.productId) === productId ? { ...item, quantity } : item
      )
      .filter((item) => item.quantity > 0);
    try {
      await persist(next);
    } catch {
      // Error already shown; items restored in persist.
    }
  };

  const removeItem = async (productId) => {
    try {
      await persist(items.filter((item) => getId(item.productId) !== productId));
    } catch {
      // Error already shown; items restored in persist.
    }
  };

  const checkout = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }
    try {
      const orderItems = items.map((item) => ({
        productId: getId(item.productId),
        productName: item.productId?.productName || "Product",
        productPrice: item.productId?.productPrice || 0,
        quantity: item.quantity,
      }));
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.productPrice * item.quantity,
        0
      );
      await createOrderRequest({ orderItems, totalAmount, pickupDetails }, token);
      await persist([]);
      setMessage("Order placed. Track it in the Orders tab.");
    } catch (err) {
      setError(err.message);
    }
  };

  const total = items.reduce((sum, item) => {
    const price = item.productId?.productPrice || 0;
    return sum + price * item.quantity;
  }, 0);

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

      {!loading && (loadError || !items.length) ? (
        <ListEmptyState
          icon={ShoppingCart}
          title={loadError ? "Unable to load cart" : "Cart is empty"}
          message={loadError || "Your cart is empty."}
        />
      ) : null}

      {!loading && !loadError && items.length ? (
        <>
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const id = getId(item.productId) || item._id;
              return (
                <CartItemCard
                  key={id}
                  item={item}
                  onQuantityChange={updateQuantity}
                  onRemove={removeItem}
                />
              );
            })}
          </div>

          <form onSubmit={checkout} className="mt-6 space-y-4">
            <p className="text-lg font-bold">Total: {formatPeso(total)}</p>
            <label className="block text-sm">
              Pickup details
              <input
                value={pickupDetails}
                onChange={(event) => setPickupDetails(event.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>
            <Button type="submit" variant="custom2">
              Place order
            </Button>
          </form>
        </>
      ) : null}
    </section>
  );
};

export default CartPage;
