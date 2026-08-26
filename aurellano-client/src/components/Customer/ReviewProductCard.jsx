import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import ActivityCard from "./ActivityCard";
import ProductImage from "../ProductImage";
import { formatDate } from "../../utils/format";

const ReviewProductCard = ({ entry, selected = false, onSelect }) => {
  const isReviewed = Boolean(entry.review);
  const image = entry.productImage || "";
  const slug = entry.productSlug || "";

  const imageBlock = (
    <div className="overflow-hidden rounded-xl bg-zinc-200">
      <ProductImage
        src={image}
        alt={entry.productName}
        className="aspect-square w-24 object-cover sm:w-28"
        iconClassName="h-8 w-8"
      />
    </div>
  );

  return (
    <ActivityCard
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(entry)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(entry);
        }
      }}
      className={[
        "cursor-pointer transition hover:bg-zinc-50",
        selected ? "ring-2 ring-secondary" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex gap-4">
        {slug ? (
          <Link
            to={`/shop/${slug}`}
            className="shrink-0 transition hover:opacity-90"
            onClick={(event) => event.stopPropagation()}
          >
            {imageBlock}
          </Link>
        ) : (
          <div className="shrink-0">{imageBlock}</div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-primary">{entry.productName}</p>
              {entry.orderedAt ? (
                <p className="mt-1 text-sm text-zinc-500">{formatDate(entry.orderedAt)}</p>
              ) : null}
            </div>
            <span
              className={[
                "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                isReviewed ? "bg-green-100 text-green-800" : "bg-secondary/30 text-shade",
              ].join(" ")}
            >
              {isReviewed ? "Reviewed" : "Not reviewed"}
            </span>
          </div>

          {isReviewed ? (
            <div className="mt-3 border-t border-zinc-100 pt-3">
              <p className="flex items-center gap-1 text-sm font-medium text-shade">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary" strokeWidth={2} />
                {entry.review.reviewRating}/5
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {entry.review.reviewComment || "No comment"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-zinc-600">
              {isReviewed ? "Click to view your review." : "Click to write a review for this product."}
            </p>
          )}
        </div>
      </div>
    </ActivityCard>
  );
};

export default ReviewProductCard;
