import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import Layout from "./layouts/Layout";
import CustomerLayout from "./layouts/CustomerLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

import ProductPage from "./pages/LandingPages/ProductPage";
import HomePage from "./pages/LandingPages/HomePage";
import AboutPage from "./pages/LandingPages/AboutPage";
import ProductListPage from "./pages/LandingPages/ProductListPage";

import SignInPage from "./pages/AuthPages/SignInPage";
import SignUpPage from "./pages/AuthPages/SignUpPage";

import ProductsPage from "./pages/CustomerPages/ProductsPage";
import ProductDetailPage from "./pages/CustomerPages/ProductDetailPage";
import AccountActivityPage from "./pages/AccountPages/AccountActivityPage";
import CartPage from "./pages/AccountPages/CartPage";
import OrdersPage from "./pages/AccountPages/OrdersPage";
import ReviewPage from "./pages/AccountPages/ReviewPage";
import ProfilePage from "./pages/AccountPages/ProfilePage";

import OverviewPage from "./pages/AdminPages/OverviewPage";
import AdminProductsPage from "./pages/AdminPages/ProductsPage";
import AdminOrdersPage from "./pages/AdminPages/OrdersPage";
import AdminReviewsPage from "./pages/AdminPages/ReviewsPage";
import AdminUsersPage from "./pages/AdminPages/UsersPage";

import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { AuthProvider } from "./context/AuthContext";

const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "products/:name", element: <ProductPage /> },
    ],
  },
  {
    element: <GuestRoute />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { path: "signin", element: <SignInPage /> },
          { path: "signup", element: <SignUpPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["customer"]} />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <CustomerLayout />,
        children: [
          { path: "shop", element: <ProductsPage /> },
          { path: "shop/:slug", element: <ProductDetailPage /> },
          {
            path: "account",
            element: <AccountActivityPage />,
            children: [
              { index: true, element: <Navigate to="cart" replace /> },
              { path: "cart", element: <CartPage /> },
              { path: "orders", element: <OrdersPage /> },
              { path: "reviews", element: <ReviewPage /> },
            ],
          },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={["Admin"]} />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "reviews", element: <AdminReviewsPage /> },
          { path: "users", element: <AdminUsersPage /> },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
