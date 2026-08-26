import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Outlet />;
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.userRole)) {
    return (
      <Navigate
        to={
          user.userRole === "Admin"
            ? "/admin"
            : user.userRole === "supplier"
              ? "/supplier"
              : "/shop"
        }
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
