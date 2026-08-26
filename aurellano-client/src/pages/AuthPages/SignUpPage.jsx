import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

const inputClasses =
  "mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50";

const actionButtonClassName =
  "w-full rounded-xl py-3 text-[11px] tracking-[0.2em]";

const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userRole: "customer",
    supplierName: "",
    supplierDescription: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await signup(form);
      navigate("/auth/signin", {
        replace: true,
        state: { message: "Account created. Please sign in." },
      });
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
        Support NU Bulldog Exchange
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral1">
        Create a store account for faster checkout, order updates, and pickup
        details.
      </p>
      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first-name" className="text-sm font-medium text-secondary">
              First Name
            </label>
            <input
              id="first-name"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={onChange}
              placeholder="First name"
              autoComplete="given-name"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-medium text-secondary">
              Last Name
            </label>
            <input
              id="last-name"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={onChange}
              placeholder="Last name"
              autoComplete="family-name"
              required
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-sm font-medium text-secondary">
            Email
          </label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password" className="text-sm font-medium text-secondary">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password"
            autoComplete="new-password"
            minLength={6}
            required
            className={inputClasses}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="signup-role" className="text-sm font-medium text-secondary">
            Account type
          </label>
          <select
            id="signup-role"
            name="userRole"
            value={form.userRole}
            onChange={onChange}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none"
          >
            <option value="customer">customer</option>
            <option value="supplier">supplier</option>
          </select>
        </div>

        {form.userRole === "supplier" ? (
          <div className="grid gap-5 sm:grid-cols-2 sm:col-span-2">
            <label>
              <span className="text-sm font-medium text-secondary">Supplier name</span>
              <input
                name="supplierName"
                value={form.supplierName}
                onChange={onChange}
                required
                className={inputClasses}
              />
            </label>
            <label>
              <span className="text-sm font-medium text-secondary">Supplier description</span>
              <textarea
                name="supplierDescription"
                value={form.supplierDescription}
                onChange={onChange}
                required
                className={`${inputClasses} min-h-28`}
              />
            </label>
          </div>
        ) : null}

        <Button type="submit" variant="custom2" className={actionButtonClassName} disabled={saving}>
          {saving ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-8 border-t border-zinc-200 pt-6 text-sm text-neutral1">
        Already have an account?{" "}
        <Link
          to="/auth/signin"
          className="font-semibold text-neutral1 transition hover:text-secondary"
        >
          Log In
        </Link>
      </div>
    </>
  );
};

export default SignUpPage;
