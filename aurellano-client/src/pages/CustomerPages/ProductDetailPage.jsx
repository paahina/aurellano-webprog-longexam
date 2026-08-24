import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Check, ShoppingCart, Star } from "lucide-react";
import Button from "../../components/Button";
import ProductDetailSkeleton from "../../components/Customer/ProductDetailSkeleton";
import ProductImage from "../../components/ProductImage";
import { useAuth } from "../../context/AuthContext";
import { addToCartRequest, getProductsRequest, getReviewsRequest } from "../../services/api";
import { averageRating, formatPeso } from "../../utils/format";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState("");
  const addedTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const products = await getProductsRequest({ limit: 100 });
        const match = products.find((item) => item.productSlug === slug);
        if (!match) {
          if (!cancelled) setProduct(null);
          return;
        }
        const productReviews = await getReviewsRequest({ productId: match._id });
        if (cancelled) return;
        setProduct(match);
        setReviews(productReviews);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  const showAddedCheck = () => {
    if (addedTimer.current) clearTimeout(addedTimer.current);
    setJustAdded(true);
    addedTimer.current = setTimeout(() => {
      setJustAdded(false);
      addedTimer.current = null;
    }, 3000);
  };

  const addToCart = async () => {
    setError("");
    try {
      await addToCartRequest(token, product._id, 1);
      showAddedCheck();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <section className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary">Product not found</h1>
        <Button to="/shop" variant="custom5" className="mt-6">
          Back to products
        </Button>
      </section>
    );
  }

  const rating = averageRating(reviews);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
      <Button to="/shop" variant="custom5">
        <span className="inline-flex items-center gap-2">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to products
        </span>
      </Button>

      <section className="rounded-3xl bg-primary p-6 text-neutral1">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="mx-auto w-full max-w-xs shrink-0 overflow-hidden rounded-[1.25rem] bg-zinc-200 md:mx-0 md:w-64 lg:w-72">
            <ProductImage
              src={product.productImage}
              alt={product.productName}
              className="aspect-square h-full w-full object-cover"
              iconClassName="h-16 w-16"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
              {product.categoryId?.categoryName || "Product"}
            </p>
            <h1 className="mt-2 text-3xl font-bold">{product.productName}</h1>
            <p className="mt-3 text-xl font-bold text-secondary">
              {formatPeso(product.productPrice)}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-secondary text-secondary" strokeWidth={2} />
              {rating
                ? `${rating.toFixed(1)} / 5 from ${reviews.length} reviews`
                : "No reviews yet"}
            </p>
            <p className="mt-4 text-sm leading-7 text-neutral1">
              {product.productDescription}
            </p>
            <p className="mt-3 text-sm">Stock: {product.stockQuantity}</p>
            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            <div className="mt-6 flex items-center gap-3">
              <Button
                type="button"
                variant="custom2"
                onClick={addToCart}
                disabled={product.stockQuantity < 1}
              >
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
                  Add to cart
                </span>
              </Button>
              <span
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition",
                  justAdded
                    ? "border-green-400 bg-green-50 text-green-700"
                    : "border-transparent text-transparent",
                ].join(" ")}
                aria-hidden={!justAdded}
              >
                {justAdded ? <Check className="h-5 w-5" strokeWidth={2.5} /> : null}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-zinc-100 p-6">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-primary">
          <Star className="h-6 w-6" strokeWidth={2} />
          Reviews
        </h2>
        {!reviews.length ? (
          <p className="mt-3 text-sm text-zinc-600">No reviews for this product yet.</p>
        ) : null}
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <article key={review._id} className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-shade">
                {review.userId?.firstName} {review.userId?.lastName} · {review.reviewRating}/5
              </p>
              <p className="mt-2 text-sm text-zinc-700">
                {review.reviewComment || "No comment"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
