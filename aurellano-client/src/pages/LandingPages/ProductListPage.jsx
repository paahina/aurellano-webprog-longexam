import { useEffect, useState } from "react";
import Button from "../../components/Button.jsx";
import ProductList from "../../components/ProductList.jsx";
import { getProductsRequest } from "../../services/api";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      setProducts([]);
      try {
        const { products: list } = await getProductsRequest({ limit: 100, sort: "name" });
        if (!cancelled) setProducts(list);
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setLoadError(err.message || "Could not load products. Is the server running?");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex w-full flex-col gap-6">
      <section className="bg-transparent px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Products
        </p>
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          Shop campus essentials in a simple product grid
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-600 sm:text-base">
          Browse practical items for class, study, commute, and everyday campus
          routines.
        </p>
        <div className="mt-6">
          <Button to="/" variant="secondary">
            Back Home
          </Button>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary">
            Featured Products
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral1">
            Product card grid
          </h2>
        </div>

        {loading ? <p className="text-sm text-neutral1">Loading products...</p> : null}
        {loadError ? <p className="text-sm text-red-300">{loadError}</p> : null}
        {!loading && !loadError && !products.length ? (
          <p className="text-sm text-neutral1">No products available.</p>
        ) : null}
        {!loading && !loadError && products.length ? <ProductList products={products} /> : null}
      </section>
    </div>
  );
};

export default ProductListPage;
