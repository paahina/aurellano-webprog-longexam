import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import { useAuth } from "../context/AuthContext";

const LogoutButton = ({ variant = "custom5", className, children = "Log Out" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setOpen(false);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Yes"
        cancelLabel="No"
        confirmVariant="custom2"
        loading={loading}
        onCancel={() => (loading ? null : setOpen(false))}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default LogoutButton;
