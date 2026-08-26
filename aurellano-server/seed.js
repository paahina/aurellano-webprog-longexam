require("./config/config");
const connectDB = require("./config/db");
const User = require("./models/userModel");
const Category = require("./models/categoryModel");
const Supplier = require("./models/supplierModel");
const Product = require("./models/productModel");
const Cart = require("./models/cartModel");
const Orders = require("./models/orderModel");
const Reviews = require("./models/reviewModel");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      Reviews.collection.drop().catch(() => {}),
      Orders.collection.drop().catch(() => {}),
      Cart.collection.drop().catch(() => {}),
      Product.collection.drop().catch(() => {}),
      Category.collection.drop().catch(() => {}),
      Supplier.collection.drop().catch(() => {}),
      User.collection.drop().catch(() => {}),
    ]);

    const users = await User.create([
      {
        firstName: "Juan",
        lastName: "Dela Cruz",
        email: "jdelacruz@students.national-u.edu.ph",
        password: "password123",
        userRole: "customer",
        isActive: true,
      },
      {
        firstName: "Maria",
        lastName: "Santos",
        email: "msantos@students.national-u.edu.ph",
        password: "password123",
        userRole: "customer",
        isActive: true,
      },
      {
        firstName: "Alex",
        lastName: "Reyes",
        email: "areyes@national-u.edu.ph",
        password: "password123",
        userRole: "Admin",
        isActive: true,
      },
    ]);

    const categories = await Category.create([
      {
        categoryName: "Apparel",
        categoryDescription:
          "Official NU Bulldogs shirts, hoodies, and varsity wear in yellow and blue.",
      },
      {
        categoryName: "Accessories",
        categoryDescription:
          "Campus novelty items such as plushies, tumblers, and fan gear.",
      },
      {
        categoryName: "Uniforms",
        categoryDescription:
          "Official course uniforms and scrub tops available at Bulldogs Exchange.",
      },
    ]);

    const [apparel, accessories, uniforms] = categories;

    const suppliers = await Supplier.create([
      {
        supplierName: "Nike",
        supplierDescription:
          "Official athletic apparel partner for NU Bulldogs shirts, hoodies, and uniforms.",
      },
      {
        supplierName: "Official NU",
        supplierDescription:
          "Campus store supplier for Bulldogs Exchange novelty items and accessories.",
      },
    ]);

    const [nike, officialNu] = suppliers;

    await User.create([
      {
        firstName: "Nike",
        lastName: "Supplier",
        email: "nike.supplier@national-u.edu.ph",
        password: "password123",
        userRole: "supplier",
        supplierId: nike._id,
        isActive: true,
      },
      {
        firstName: "Official NU",
        lastName: "Supplier",
        email: "officialnu.supplier@national-u.edu.ph",
        password: "password123",
        userRole: "supplier",
        supplierId: officialNu._id,
        isActive: true,
      },
    ]);

    const products = await Product.create([
      {
        productName: "NU Bulldogs T-Shirt",
        productSlug: "nu-bulldogs-t-shirt",
        productDescription:
          "Casual UAAP-inspired NU Bulldogs tee for students and fans.",
        productPrice: 299,
        productImage: "/assets/imgs/nu-shirt.jpg",
        stockQuantity: 50,
        stockStatus: "in_stock",
        supplierId: nike._id,
        categoryId: apparel._id,
      },
      {
        productName: "NU Hoodie",
        productSlug: "nu-hoodie",
        productDescription:
          "National University Bulldog hoodie and varsity-style jackets.",
        productPrice: 999,
        productImage: "/assets/imgs/nu-hoodie.jpg",
        stockQuantity: 30,
        stockStatus: "in_stock",
        supplierId: nike._id,
        categoryId: apparel._id,
      },
      {
        productName: "Basketball Jersey",
        productSlug: "basketball-jersey",
        productDescription:
          "Full sublimation NU basketball jersey with Bulldogs branding.",
        productPrice: 319,
        productImage: "/assets/imgs/nu-jersey.jpg",
        stockQuantity: 40,
        stockStatus: "in_stock",
        supplierId: nike._id,
        categoryId: apparel._id,
      },
      {
        productName: "Bulldog Plushie",
        productSlug: "bulldog-plushie",
        productDescription:
          "Official NU Bulldog plushie from Bulldogs Exchange novelty items.",
        productPrice: 349,
        productImage: "/assets/imgs/nu-bulldog-plushie.png",
        stockQuantity: 25,
        stockStatus: "in_stock",
        supplierId: officialNu._id,
        categoryId: accessories._id,
      },
      {
        productName: "NU Tumbler",
        productSlug: "nu-tumbler",
        productDescription: "NU Bulldogs tumbler for campus and everyday use.",
        productPrice: 699,
        productImage: "/assets/imgs/nu-tumbler.jpg",
        stockQuantity: 35,
        stockStatus: "in_stock",
        supplierId: officialNu._id,
        categoryId: accessories._id,
      },
      {
        productName: "Nursing Uniform",
        productSlug: "nursing-uniform",
        productDescription:
          "Official nursing scrub top with NU insignia for nursing students.",
        productPrice: 799,
        productImage: "/assets/imgs/nu-nursing.jpg",
        stockQuantity: 20,
        stockStatus: "in_stock",
        supplierId: nike._id,
        categoryId: uniforms._id,
      },
    ]);

    const [tshirt, hoodie, jersey, plushie, tumbler, nursing] = products;

    const orderItem = (product, quantity, productPrice = product.productPrice) => ({
      productId: product._id,
      productName: product.productName,
      productPrice,
      quantity,
      productImage: product.productImage || "",
      productSlug: product.productSlug || "",
    });

    await Cart.create([
      {
        userId: users[0]._id,
        cartItems: [
          { productId: tshirt._id, quantity: 2 },
          { productId: plushie._id, quantity: 1 },
        ],
      },
      {
        userId: users[1]._id,
        cartItems: [
          { productId: hoodie._id, quantity: 1 },
          { productId: tumbler._id, quantity: 1 },
        ],
      },
      {
        userId: users[2]._id,
        cartItems: [{ productId: nursing._id, quantity: 1 }],
      },
    ]);

    await Orders.create([
      {
        userId: users[0]._id,
        supplierId: nike._id,
        orderItems: [orderItem(tshirt, 2)],
        totalAmount: 299 * 2,
        orderStatus: "pending",
        pickupDetails: "NU Manila Bulldogs Exchange - Main Building",
      },
      {
        userId: users[0]._id,
        supplierId: officialNu._id,
        orderItems: [orderItem(plushie, 1)],
        totalAmount: 349,
        orderStatus: "pending",
        pickupDetails: "NU Manila Bulldogs Exchange - Main Building",
      },
      {
        userId: users[1]._id,
        supplierId: nike._id,
        orderItems: [orderItem(hoodie, 1)],
        totalAmount: 999,
        orderStatus: "confirmed",
        pickupDetails: "NU Manila Bulldogs Exchange - Social Hall",
      },
      {
        userId: users[1]._id,
        supplierId: officialNu._id,
        orderItems: [orderItem(tumbler, 1)],
        totalAmount: 699,
        orderStatus: "confirmed",
        pickupDetails: "NU Manila Bulldogs Exchange - Social Hall",
      },
      {
        userId: users[2]._id,
        supplierId: nike._id,
        orderItems: [orderItem(jersey, 1), orderItem(nursing, 1)],
        totalAmount: 319 + 799,
        orderStatus: "delivered",
        pickupDetails: "NU East Ortigas Bulldogs Exchange",
      },
    ]);

    await Reviews.create([
      {
        userId: users[0]._id,
        productId: tshirt._id,
        reviewRating: 5,
        reviewComment: "Great quality Bulldogs tee. Perfect for game day!",
      },
      {
        userId: users[0]._id,
        productId: plushie._id,
        reviewRating: 4,
        reviewComment: "Cute NU mascot plushie from Bulldogs Exchange.",
      },
      {
        userId: users[1]._id,
        productId: hoodie._id,
        reviewRating: 5,
        reviewComment: "Warm and stylish. Love the yellow and blue details.",
      },
      {
        userId: users[1]._id,
        productId: tumbler._id,
        reviewRating: 4,
        reviewComment: "Solid tumbler for campus use.",
      },
      {
        userId: users[2]._id,
        productId: nursing._id,
        reviewRating: 5,
        reviewComment: "Official nursing uniform fits well and looks sharp.",
      },
    ]);

    console.log("Seed completed successfully");
    console.log({
      users: users.length,
      categories: categories.length,
      suppliers: suppliers.length,
      products: products.length,
      carts: 3,
      orders: 5,
      reviews: 5,
    });
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
