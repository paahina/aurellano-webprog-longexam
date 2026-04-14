import Button from "./Button";

const ProductCard = ({ product, index }) => {
  return (
    <article className="rounded-3xl bg-zinc-100 p-4 shadow-[5px_5px_15px_rgba(0,0,0,0.3)]">
      <div className="flex aspect-4/3 items-center justify-center rounded-[1.25rem] bg-zinc-200">
        <img
          src={product.prodImage}
          alt={product.prodName}
          className="h-full w-full object-cover rounded-[1.25rem]"
        />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-shade">
        Product {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-primary">
        {product.prodName}
      </h3>
      <p className="mt-2 text-base font-bold text-zinc-900">
        {product.prodPrice}
      </p>
      <p className="mt-3 text-sm leading-6 text-zinc-600">
        {product.description.substring(0, 120)}...
      </p>
      <Button
        to={`/products/${product.prodName}`}
        className="mt-4"
        variant="custom2"
      >
        View Product
      </Button>
    </article>
  );
};

export default ProductCard;
