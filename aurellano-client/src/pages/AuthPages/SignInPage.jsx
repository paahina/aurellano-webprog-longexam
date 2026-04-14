import { Link } from "react-router-dom";
import Button from "../../components/Button";

const inputClasses =
  "mt-2 w-full rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-zinc-50";

const actionButtonClassName =
  "w-full rounded-xl py-3 text-[11px] tracking-[0.2em]";

const SignInPage = () => {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
        Welcome Back!
      </h1>
      <p className="mt-3 text-sm leading-6 text-neutral1">
        Access your store account to review orders, saved items, and pickup
        details.
      </p>

      <form className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="signin-email"
            className="text-sm font-medium text-secondary"
          >
            Email Address
          </label>
          <input
            id="signin-email"
            type="email"
            placeholder="student@email.com"
            autoComplete="email"
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="signin-password"
            className="text-sm font-medium text-secondary"
          >
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className={inputClasses}
          />
          <p className="mt-2 text-xs leading-5 text-tint">
            It must be a combination of minimum 8 letters, numbers, and symbols.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="flex items-center gap-2 text-tint">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="font-medium text-neutral1 transition hover:text-secondary"
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          variant="custom2"
          className={actionButtonClassName}
          to="/"
        >
          Log In
        </Button>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="custom3"
            className={actionButtonClassName}
            to="/"
          >
            Log In with Google
          </Button>
          <Button
            type="button"
            variant="custom3"
            className={actionButtonClassName}
            to="/"
          >
            Log In with Apple
          </Button>
        </div>
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
