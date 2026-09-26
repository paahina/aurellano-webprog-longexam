const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const { PORT } = require("./config/config");
const connectDB = require("./config/db");
const { auditLoggerMiddleware } = require("./middleware/auditLoggerMiddleware");

const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const cartRoutes = require("./routes/cartRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: "sameorigin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(auditLoggerMiddleware);

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reviews", reviewsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image file too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.message === "Only image files are allowed.") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  res.status(500).json({ message: "Server Error" });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
