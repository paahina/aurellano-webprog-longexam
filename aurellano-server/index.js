require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const productV1Routes = require("./routes/v1/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const cartRoutes = require("./routes/cartRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "*",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/v1/products", productV1Routes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reviews", reviewsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
