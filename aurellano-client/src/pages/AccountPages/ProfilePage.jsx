import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut, User } from "lucide-react";
import Button from "../../components/Button";
import ProfileSkeleton from "../../components/Customer/ProfileSkeleton";
import { useAuth } from "../../context/AuthContext";
import {
  getSupplierByIdRequest,
  updateSupplierRequest,
  updateUserRequest,
} from "../../services/api";

const inputClasses =
  "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none";

const ProfilePage = () => {
  const { user, setUser, token, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [supplierProfile, setSupplierProfile] = useState({
    supplierName: "",
    supplierDescription: "",
  });
  const [supplierSaving, setSupplierSaving] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const isSupplier = user?.userRole === "supplier";

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    });
  }, [user]);

  useEffect(() => {
    if (!user || !isSupplier || !user.supplierId) return;
    let cancelled = false;
    const load = async () => {
      setSupplierLoading(true);
      try {
        const supplier = await getSupplierByIdRequest(user.supplierId);
        if (cancelled) return;
        setSupplierProfile({
          supplierName: supplier.supplierName || "",
          supplierDescription: supplier.supplierDescription || "",
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setSupplierLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user, isSupplier]);

  const saveSupplierProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSupplierSaving(true);
    try {
      await updateSupplierRequest(user.supplierId, supplierProfile, token);
      setMessage("Supplier updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSupplierSaving(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const updated = await updateUserRequest(user._id, profile, token);
      setUser(updated);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const updated = await updateUserRequest(user._id, passwords, token);
      setUser(updated);
      setPasswords({ currentPassword: "", password: "" });
      setMessage("Password updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
        Account
      </p>
      <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">
        <User className="h-8 w-8" strokeWidth={2} />
        Profile
      </h1>
      {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <form onSubmit={saveProfile} className="mt-6 rounded-3xl bg-zinc-100 p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary">
          <User className="h-5 w-5" strokeWidth={2} />
          Your information
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            First name
            <input
              className={inputClasses}
              value={profile.firstName}
              onChange={(event) => setProfile((prev) => ({ ...prev, firstName: event.target.value }))}
            />
          </label>
          <label className="text-sm">
            Last name
            <input
              className={inputClasses}
              value={profile.lastName}
              onChange={(event) => setProfile((prev) => ({ ...prev, lastName: event.target.value }))}
            />
          </label>
        </div>
        <label className="mt-4 block text-sm">
          Email
          <input
            type="email"
            className={inputClasses}
            value={profile.email}
            onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
        <Button type="submit" variant="custom2" className="mt-4" disabled={saving}>
          Save information
        </Button>
      </form>

      {isSupplier ? (
        <form
          onSubmit={saveSupplierProfile}
          className="mt-6 rounded-3xl bg-zinc-100 p-6"
        >
          <h2 className="flex items-center gap-2 text-xl font-semibold text-primary">
            <User className="h-5 w-5" strokeWidth={2} />
            Supplier brand/company info
          </h2>
          <label className="mt-4 block text-sm">
            Supplier name
            <input
              className={inputClasses}
              value={supplierProfile.supplierName}
              onChange={(event) =>
                setSupplierProfile((prev) => ({
                  ...prev,
                  supplierName: event.target.value,
                }))
              }
              required
            />
          </label>
          <label className="mt-4 block text-sm">
            Supplier description
            <textarea
              className={`${inputClasses} min-h-28`}
              value={supplierProfile.supplierDescription}
              onChange={(event) =>
                setSupplierProfile((prev) => ({
                  ...prev,
                  supplierDescription: event.target.value,
                }))
              }
              required
            />
          </label>
          <Button
            type="submit"
            variant="custom2"
            className="mt-4"
            disabled={supplierSaving || supplierLoading}
          >
            {supplierSaving ? "Saving..." : "Save supplier info"}
          </Button>
        </form>
      ) : null}

      <form onSubmit={savePassword} className="mt-6 rounded-3xl bg-zinc-100 p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary">
          <KeyRound className="h-5 w-5" strokeWidth={2} />
          Change password
        </h2>
        <label className="mt-4 block text-sm">
          Current password
          <input
            type="password"
            className={inputClasses}
            value={passwords.currentPassword}
            onChange={(event) =>
              setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
          />
        </label>
        <label className="mt-4 block text-sm">
          New password
          <input
            type="password"
            className={inputClasses}
            minLength={6}
            value={passwords.password}
            onChange={(event) => setPasswords((prev) => ({ ...prev, password: event.target.value }))}
          />
        </label>
        <Button type="submit" variant="custom2" className="mt-4" disabled={saving}>
          Update password
        </Button>
      </form>

      <div className="mt-6 rounded-3xl bg-zinc-100 p-6">
        <Button type="button" variant="custom5" className="w-full" onClick={onLogout}>
          <span className="inline-flex items-center justify-center gap-2">
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Log Out
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
