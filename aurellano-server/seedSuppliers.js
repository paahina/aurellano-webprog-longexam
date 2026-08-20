require("dotenv").config();
const connectDB = require("./config/db");
const Supplier = require("./models/supplierModel");
const Product = require("./models/productModel");

const seedSuppliers = async () => {
  try {
    await connectDB();

    const nike = await Supplier.findOneAndUpdate(
      { supplierName: "Nike" },
      {
        supplierName: "Nike",
        supplierDescription:
          "Official athletic apparel partner for NU Bulldogs shirts, hoodies, and uniforms.",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    const officialNu = await Supplier.findOneAndUpdate(
      { supplierName: "Official NU" },
      {
        supplierName: "Official NU",
        supplierDescription:
          "Campus store supplier for Bulldogs Exchange novelty items and accessories.",
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    await Product.updateMany(
      {
        productSlug: {
          $in: [
            "nu-bulldogs-t-shirt",
            "nu-hoodie",
            "basketball-jersey",
            "nursing-uniform",
          ],
        },
      },
      { supplierId: nike._id }
    );

    await Product.updateMany(
      {
        productSlug: {
          $in: ["bulldog-plushie", "nu-tumbler"],
        },
      },
      { supplierId: officialNu._id }
    );

    const suppliers = await Supplier.find().select("supplierName");
    console.log("Supplier seed completed successfully");
    console.log(suppliers);
    process.exit(0);
  } catch (error) {
    console.error("Supplier seed failed:", error.message);
    process.exit(1);
  }
};

seedSuppliers();
