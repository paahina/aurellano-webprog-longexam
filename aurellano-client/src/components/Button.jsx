import { Link } from "react-router-dom";

const variantClasses = {
  primary:
    "bg-zinc-900 text-zinc-50 rounded-full font-semibold hover:bg-zinc-700",
  secondary:
    "bg-zinc-50 text-zinc-900 rounded-full font-semibold hover:bg-zinc-200",
  custom1:
    "text-primary bg-secondary font-extrabold rounded-xl hover:bg-secondary-hover",
};

const Button = ({
  children,
  to,
  type = "button",
  variant = "secondary",
  className = "",
}) => {
  const classes = [
    "inline-flex items-center justify-center px-4 py-2 text-[10px] uppercase tracking-[0.24em] transition",
    variantClasses[variant] ?? variantClasses.secondary,
    className,
  ]
    .join(" ")
    .trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
};

export default Button;
