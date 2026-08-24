export const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

export const formatPeso = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH")}`;

export const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const averageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + Number(review.reviewRating || 0), 0);
  return total / reviews.length;
};
