import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import ProductImage from "../../components/ProductImage";
import { getProductsRequest } from "../../services/api";
import { formatPeso } from "../../utils/format";

function ProductPage() {
  const { name } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      setProduct(null);
      try {
        const products = await getProductsRequest({ limit: 100 });
        if (cancelled) return;
        const match = products.find(
          (item) => item.productSlug === name || item.productName === name
        );
        setProduct(match || null);
        if (!match) setLoadError("Product not found");
      } catch (err) {
        if (!cancelled) {
          setProduct(null);
          setLoadError(err.message || "Could not load product. Is the server running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [name]);

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <p className="text-sm text-zinc-600">Loading product...</p>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-primary">
              {loadError || "Product not found"}
            </h1>
            <Button to="/products" variant="custom5" className="mt-6">
              Back to Products
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products" variant="custom5">
              Back to Products
            </Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {product.categoryId?.categoryName || "Product"}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {product.productName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="font-bold text-shade">{formatPeso(product.productPrice)}</span>
            {product.productStock != null ? <span>Stock: {product.productStock}</span> : null}
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 overflow-hidden rounded-[1.25rem] bg-zinc-200 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <ProductImage
              src={product.productImage}
              alt={product.productName}
              className="aspect-4/3 h-full w-full rounded-[1.25rem] object-cover"
              iconClassName="h-16 w-16"
            />
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-zinc-700">
            <p className="whitespace-pre-wrap text-base leading-7 text-neutral1">
              {product.productDescription}
            </p>
          </div>

          <div className="mt-8 border-t-2 border-neutral1 pt-6">
            <Button to="/auth/signin" variant="custom2" className="mr-3">
              Sign in to shop
            </Button>
            <Button to="/products" variant="custom5">
              Back to Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
