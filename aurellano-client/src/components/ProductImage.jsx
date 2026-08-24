import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

const ProductImage = ({ src, alt = "", className = "", iconClassName = "h-10 w-10" }) => {
  const [failed, setFailed] = useState(false);
  const hasSrc = Boolean(src) && !failed;

  if (!hasSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-200 text-zinc-500 ${className}`}
        aria-label={alt || "No product image"}
        role="img"
      >
        <ImageIcon className={iconClassName} strokeWidth={1.75} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default ProductImage;
