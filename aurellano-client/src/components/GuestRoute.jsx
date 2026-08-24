import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary text-sm text-zinc-600">
        Loading account...
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.userRole === "Admin" ? "/admin" : "/shop"} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
