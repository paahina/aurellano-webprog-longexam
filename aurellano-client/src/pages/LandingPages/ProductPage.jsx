import { useParams } from "react-router-dom";
import Button from "../../components/Button.jsx";
import products from "../../assets/product-content.js";

function ProductPage() {
  const { name } = useParams();
  const product = products.find((product) => product.prodName === name);

  if (!product) {
    return (
      <div className="flex w-full flex-col gap-6">
        <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold text-primary">
              Product not found
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
      <section className=" px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button to="/products" variant="custom5">
              Back to Products
            </Button>
          </div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Product
          </p>
          <h1 className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {product.prodName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="font-bold text-shade">{product.prodPrice}</span>
            <span>{product.prodSize}</span>
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex aspect-4/3 items-center justify-center rounded-[1.25rem] shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
            <img
              src={product.prodImage}
              alt={product.prodName}
              className="h-full w-full object-cover rounded-[1.25rem]"
            />
          </div>

          <div className="prose prose-sm max-w-none space-y-4 text-zinc-700">
            <p className="text-base leading-7 text-neutral1 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <div className="mt-8 border-t-2 border-neutral1 pt-6">
            <Button variant="custom2" className="mr-3">
              Add to Cart
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
