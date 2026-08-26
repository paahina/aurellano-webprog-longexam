import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

const inputClasses =
  "mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50";

const actionButtonClassName =
  "w-full rounded-xl py-3 text-[11px] tracking-[0.2em]";

const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [message] = useState(location.state?.message || "");
  const [saving, setSaving] = useState(false);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const user = await login(form);
      const fallback =
        user.userRole === "Admin" ? "/admin" : user.userRole === "supplier" ? "/supplier" : "/shop";
      const from = location.state?.from?.pathname;
      navigate(from || fallback, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button to="/" variant="custom3" className="mb-6 px-0">
        <span className="inline-flex items-center gap-2 text-sm normal-case tracking-normal">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to home
        </span>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
        Welcome Back!
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral1">
        Access your store account to review orders, saved items, and pickup
        details.
      </p>
      {message ? <p className="mt-4 text-sm text-green-300">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="signin-email" className="text-sm font-medium text-secondary">
            Email Address
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="student@email.com"
            autoComplete="email"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="signin-password" className="text-sm font-medium text-secondary">
            Password
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            autoComplete="current-password"
            required
            className={inputClasses}
          />
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-tint">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={onChange}
              className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
            />
            <span>Remember me</span>
          </label>
        </div>

        <Button type="submit" variant="custom2" className={actionButtonClassName} disabled={saving}>
          {saving ? "Signing in..." : "Log In"}
        </Button>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-neutral1">
        No account yet?{" "}
        <Link
          to="/auth/signup"
          className="font-semibold text-neutral transition hover:text-secondary"
        >
          Sign Up
        </Link>
      </div>
    </>
  );
};

export default SignInPage;
