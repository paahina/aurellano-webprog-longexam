# Aurellano Web Programming - Long Exam

This repository contains **BulldogEx Shop** (Bulldogs Exchange), a full-stack campus e-commerce app with a React frontend and an Express + MongoDB backend.

The **client** (`aurellano-client`) is built with Vite, React Router, and Tailwind CSS. It includes public landing pages, JWT-authenticated customer shopping, admin dashboards, and supplier portals.

The **server** (`aurellano-server`) exposes REST APIs for users, products, categories, suppliers, carts, orders, and reviews, with role-based access control (RBAC).

## Tech Stack

**Client**

- React 19
- Vite
- React Router DOM
- Tailwind CSS 4
- Lucide React (icons)
- ESLint

**Server**

- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication (bcrypt password hashing)
- CORS enabled

## Main Features

**Public**

- Full-width hero banner, about page, and themed footer
- Product catalog and product detail pages backed by the API (not static data)

**Customer (`customer` role)**

- Sign in / sign up (signup always creates a customer; no auto-login)
- Shop: search, category filter, sort (rating, A–Z, Z–A), pagination (12/page)
- Cart: checkbox selection, per-supplier subtotals, optimistic qty/remove updates, multi-supplier checkout (one order per supplier)
- Orders: ongoing order history with status chips (`pending`, `confirmed`, `delivered`, `cancelled`)
- Reviews: write reviews for delivered-order products; 2-column layout with sticky write panel
- Profile: view/edit info, change password, log out
- Inactive users cannot log in

**Admin (`Admin` role)**

- Overview dashboard (product, pending order, review, and user counts)
- Manage products, orders, reviews, and users (create/edit/delete via modals)
- Confirm orders and mark ready for claiming (`confirmed` status)
- Set customers active/inactive (cannot deactivate other Admins)

**Supplier (`supplier` role)**

- Supplier-scoped products, orders, and reviews
- Overview dashboard and profile page
- Orders filtered to their supplier only

**Shared UX**

- Skeleton loading, empty states, and server-side pagination on tables/lists (mostly 10/page; shop uses 12/page)
- JWT session with protected routes and role redirects

## Project Setup

### Prerequisites

- Node.js (LTS recommended)
- MongoDB running locally or a MongoDB Atlas connection string

### Server

Install dependencies and configure environment variables inside `aurellano-server`:

```bash
cd aurellano-server
npm install
```

Create a `.env` file in `aurellano-server/` (read only via `config/config.js`):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/aurellano-shop
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
SALT=10
PORT=5000
```

Seed the database (drops and recreates sample users, products, carts, orders, and reviews):

```bash
npm run seed
```

Optional: run the supplier-only seed script:

```bash
npm run seed:suppliers
```

Start the API:

```bash
npm run dev
```

The server runs on `http://localhost:5000` by default.

**Seed accounts** (password for all: `password123`):

| Role     | Email                                      |
| -------- | ------------------------------------------ |
| Customer | `jdelacruz@students.national-u.edu.ph`     |
| Customer | `msantos@students.national-u.edu.ph`       |
| Admin    | `areyes@national-u.edu.ph`                 |
| Supplier | `nike.supplier@national-u.edu.ph`          |
| Supplier | `officialnu.supplier@national-u.edu.ph`    |

### Client

Install dependencies inside `aurellano-client`:

```bash
cd aurellano-client
npm install
```

Create a `.env` file in `aurellano-client/` pointing at the API:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Run both apps during development: start the server first, then the client.

## Push to GitHub Using Git Bash

Open **Git Bash**, then go to the project root folder:

Example:

```bash
cd /c/001_Programming/advance\ web\ programming/aurellano-webprog-longexam
```

Check the files before committing:

```bash
git status
```

If this folder is not yet a Git repository, initialize it:

```bash
git init
```

Stage and commit the project:

```bash
git add .
git commit -m "initial long-exam1"
```

Create a new repository on GitHub, then connect this local project to it. Replace `<github-repo-url>` with your repository URL:

```bash
git branch -M main
git remote add origin <github-repo-url>
git push -u origin main
```

Example GitHub URL format:

```bash
git remote add origin https://github.com/your-username/your-repository-name.git
```

If the `origin` remote already exists, update it instead:

```bash
git remote set-url origin <github-repo-url>
git push -u origin main
```

For future updates after editing files:

```bash
git status
git add .
git commit -m "enhanced long-exam1"
git push
```

## Current Routes

**Public**

- `/` — Home page
- `/about` — About page
- `/products` — Public product list (API)
- `/products/:name` — Public product detail by slug

**Authentication (guest only)**

- `/auth/signin` — Sign in
- `/auth/signup` — Sign up

**Customer (protected)**

- `/shop` — Product catalog
- `/shop/:slug` — Product detail
- `/account/cart` — Cart (default account tab)
- `/account/orders` — Order history
- `/account/reviews` — Product reviews
- `/profile` — Profile, edit info, change password, log out

**Admin (protected)**

- `/admin` — Overview dashboard
- `/admin/products` — Product management
- `/admin/orders` — Order management
- `/admin/reviews` — Review management
- `/admin/users` — User management

**Supplier (protected)**

- `/supplier` — Overview dashboard
- `/supplier/products` — Supplier products
- `/supplier/orders` — Supplier orders
- `/supplier/reviews` — Supplier reviews
- `/supplier/profile` — Profile page

## Key Files

**Client**

- `aurellano-client/src/App.jsx` — Route definitions and role-based layouts
- `aurellano-client/src/context/AuthContext.jsx` — JWT session state
- `aurellano-client/src/services/api.js` — API helpers (`/api/users`, `/api/products/v1`, carts, orders, reviews)
- `aurellano-client/src/pages/CustomerPages/ProductsPage.jsx` — Customer shop (search, filter, sort, pagination)
- `aurellano-client/src/pages/AccountPages/CartPage.jsx` — Cart with optimistic updates and multi-supplier checkout
- `aurellano-client/src/pages/AccountPages/ReviewPage.jsx` — 2-column review layout
- `aurellano-client/src/pages/AdminPages/` — Admin CRUD tables and overview
- `aurellano-client/src/components/Customer/` — Shared customer UI (cart, orders, reviews, skeletons)
- `aurellano-client/src/hooks/useAdminTableQuery.js` — Admin/supplier table query state

**Server**

- `aurellano-server/index.js` — Express app and route mounting
- `aurellano-server/config/config.js` — Environment configuration
- `aurellano-server/middleware/authMiddleware.js` — JWT protect + RBAC authorize
- `aurellano-server/models/` — User, Product, Category, Supplier, Cart, Orders, Reviews schemas
- `aurellano-server/controllers/ordersController.js` — Order create/update; splits checkout by supplier
- `aurellano-server/controllers/cartController.js` — Cart CRUD with populated product/supplier data
- `aurellano-server/utils/pagination.js` — Shared pagination helpers
- `aurellano-server/seed.js` — Full database seed script

**API base paths**

- `/api/users` — Login, signup, session, profile, admin user CRUD
- `/api/categories` — Category list and admin CRUD
- `/api/suppliers` — Supplier list and admin/supplier CRUD
- `/api/products` — Public catalog; `/v1` paginated routes; `/supplier/v1` for suppliers
- `/api/carts` — Customer cart
- `/api/orders` — Customer checkout, admin/supplier order management
- `/api/reviews` — Customer and admin review CRUD

## Current File Structure

```text
aurellano-webprog-longexam/
├── README.md
├── aurellano-client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js
│       ├── hooks/
│       │   └── useAdminTableQuery.js
│       ├── layouts/
│       │   ├── Layout.jsx
│       │   ├── AuthLayout.jsx
│       │   ├── CustomerLayout.jsx
│       │   ├── AdminLayout.jsx
│       │   └── SupplierLayout.jsx
│       ├── components/
│       │   ├── NavBar.jsx
│       │   ├── CustomerNavBar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── GuestRoute.jsx
│       │   ├── Admin/
│       │   └── Customer/
│       ├── pages/
│       │   ├── LandingPages/
│       │   ├── AuthPages/
│       │   ├── CustomerPages/
│       │   ├── AccountPages/
│       │   └── AdminPages/
│       └── assets/
│           └── styles/
│               └── index.css
└── aurellano-server/
    ├── index.js
    ├── package.json
    ├── seed.js
    ├── seedSuppliers.js
    ├── config/
    │   ├── config.js
    │   ├── db.js
    │   └── constants.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── tokenBlacklist.js
    ├── models/
    ├── controllers/
    ├── routes/
    └── utils/
```

## Notes

- `node_modules/`, `dist/`, and `.env` files are not listed above; they are generated or local-only.
- Public pages use `Layout.jsx`; auth pages use `AuthLayout.jsx`; logged-in areas use role-specific layouts.
- Product slugs come from the database (`slug` field), not from static `product-content.js`.
- Order status `confirmed` means the order is ready for claiming at the store.
- Checkout from a mixed-supplier cart creates **separate orders per supplier**, each with its own `supplierId`.
- Cart remove/qty changes use **optimistic UI** (instant update, background save, rollback on error).
- Admins opening customer URLs are redirected to the admin layout; suppliers use `/supplier/*`.
- Pagination defaults to **10 items per page** on admin, supplier, cart, orders, and review lists; the customer shop uses **12 per page**.

## Enhancement Instructions

The long-exam enhancements build on the original wireframe into a working e-commerce system:

1. **Backend API** — Express + MongoDB with JWT auth, RBAC, and REST routes for users, products, categories, suppliers, carts, orders, and reviews.
2. **Customer account** — Shop, cart (checkbox checkout, multi-supplier orders), order tracking, reviews, and profile management.
3. **Admin dashboard** — Overview counts plus CRUD tables for products, orders, reviews, and users (active/inactive toggle).
4. **Supplier portal** — Supplier-scoped products, orders, and reviews linked via `supplierId` on users and orders.
5. **UX polish** — Skeleton loaders, empty states, status chips, server pagination, and optimistic cart updates without full-page reloads.
6. **Seed data** — Run `npm run seed` in `aurellano-server` to populate sample NU Bulldogs Exchange products, users, carts, and orders for testing.
