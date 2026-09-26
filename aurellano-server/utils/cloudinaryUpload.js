const cloudinary = require("../config/cloudinary");

const PRODUCT_FOLDER = "bulldogs-exchange/products";

const uploadProductBuffer = async (file) => {
  if (!file?.buffer) {
    throw new Error("No image file provided.");
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: PRODUCT_FOLDER,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
};

const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete Cloudinary asset:", publicId, error.message);
  }
};

module.exports = {
  PRODUCT_FOLDER,
  uploadProductBuffer,
  deleteCloudinaryAsset,
};
