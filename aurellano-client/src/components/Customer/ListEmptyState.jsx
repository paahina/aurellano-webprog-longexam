import { createElement } from "react";
import { Slash } from "lucide-react";

const ListEmptyState = ({ icon, title, message, className = "" }) => {
  return (
    <div
      className={[
        "flex min-h-80 flex-col items-center justify-center px-4 py-12 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative flex h-24 w-24 items-center justify-center text-primary">
        {createElement(icon, {
          className: "h-20 w-20",
          strokeWidth: 1.5,
          "aria-hidden": true,
        })}
        <Slash
          className="absolute inset-0 m-auto h-24 w-24 text-primary"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-primary">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">{message}</p>
    </div>
  );
};

export default ListEmptyState;
