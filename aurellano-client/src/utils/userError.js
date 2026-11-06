const FALLBACK = "Something went wrong. Please try again.";

const EXACT = {
  "failed to fetch": "Could not reach the server. Please try again later.",
  "networkerror when attempting to fetch resource.": "Could not reach the server. Please try again later.",
  "request failed": "Something went wrong. Please try again.",
  "server error": "The server had a problem. Please try again later.",
  "validation failed": "Please check the form and try again.",
  "invalid email or password": "Email or password is incorrect.",
  "email and password are required": "Please enter your email and password.",
  "account is inactive": "This account is inactive. Please contact support.",
  "no token provided": "Please sign in to continue.",
  "invalid or expired token": "Your session expired. Please sign in again.",
  "session has ended. please log in again.": "Your session ended. Please sign in again.",
  "session is no longer valid": "Your session expired. Please sign in again.",
  "too many login attempts. please try again after 15 minutes.":
    "Too many sign-in attempts. Please wait a few minutes and try again.",
  "too many registration attempts. please try again after 1 hour.":
    "Too many sign-up attempts. Please wait and try again later.",
  "too many write requests. please try again later.":
    "Too many requests. Please wait a moment and try again.",
  "only image files are allowed.": "Please choose a JPEG, PNG, or WebP image.",
  "image file too large. maximum size is 5mb.": "That image is too large. Please use a file under 5MB.",
  "no image file provided.": "Please choose an image to upload.",
  'no image file provided. use form-data field name "image".':
    "Please choose an image to upload.",
  "product not found.": "This product could not be found.",
  "product not found": "This product could not be found.",
  "user not found": "This account could not be found.",
  "cart not found": "Your cart could not be found.",
  "order not found": "This order could not be found.",
  "review not found": "This review could not be found.",
  "supplier not found": "This supplier could not be found.",
  "category not found": "This category could not be found.",
  "current password is required": "Please enter your current password.",
  "current password is incorrect": "Your current password is incorrect.",
  "password must be at least 6 characters": "Password must be at least 6 characters.",
  "invalid user role": "Please choose a valid account type.",
  "invalid email address": "Please enter a valid email address.",
  "product name must be at least 2 characters": "Product name must be at least 2 characters.",
  "product price must be 0 or greater": "Please enter a valid price.",
  "categoryid is required": "Please choose a category.",
  "supplierid cannot be empty": "Please choose a supplier.",
  "stockquantity must be 0 or greater": "Please enter a valid stock quantity.",
  "you do not have permission to perform this action":
    "You do not have permission to do that.",
  "you do not have permission to access this resource":
    "You do not have permission to view this page.",
  "you do not have permission to update this product":
    "You do not have permission to update this product.",
  "you do not have permission to delete this product":
    "You do not have permission to delete this product.",
  "you do not have permission to upload an image for this product":
    "You do not have permission to change this product image.",
  "you do not have permission to update this supplier":
    "You do not have permission to update this supplier.",
  "you do not have permission to access this order":
    "You do not have permission to view this order.",
  "customers can only cancel their own orders": "You can only cancel your own orders.",
  "supplier name and description are required for supplier accounts":
    "Please enter a supplier name and description.",
  "supplier name and description are required when setting user as supplier":
    "Please enter a supplier name and description.",
  "admin accounts cannot be deactivated": "Admin accounts cannot be deactivated.",
  "you cannot change account status": "You cannot change this account status.",
};

const CONTAINS = [
  ["too many failed login", "Too many sign-in attempts. Please wait and try again."],
  ["e11000", "That value is already in use. Please try a different one."],
  ["duplicate key", "That value is already in use. Please try a different one."],
  ["jwt", "Your session expired. Please sign in again."],
  ["cast to objectid", "Something went wrong. Please try again."],
  ["mongo", "Could not save your changes. Please try again."],
  ["cloudinary", "Could not upload the image. Please try again."],
  ["cors", "Could not reach the server. Please try again later."],
  ["network", "Could not reach the server. Please try again later."],
  ["insufficient stock", "There is not enough stock for this order."],
  ["out of stock", "This product is out of stock."],
  ["is the server running", "Could not reach the server. Please try again later."],
];

export const toUserError = (err) => {
  const raw = String(err?.message || err || "").trim();
  if (!raw) return FALLBACK;

  const key = raw.toLowerCase();
  if (EXACT[key]) return EXACT[key];

  const matched = CONTAINS.find(([needle]) => key.includes(needle));
  if (matched) return matched[1];

  if (/^[a-z0-9 _.'-]{3,80}$/i.test(raw) && !/[:=/\\{}[\]]/.test(raw) && !/\berror\b/i.test(raw)) {
    return raw.endsWith(".") ? raw : `${raw}.`;
  }

  return FALLBACK;
};
