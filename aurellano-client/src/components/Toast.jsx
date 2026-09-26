import { useToast } from "../context/ToastContext";

const Toast = () => {
  const { toast, hideToast } = useToast();
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4">
      <div
        role={isError ? "alert" : "status"}
        className={[
          "pointer-events-auto flex max-w-xl items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-lg",
          isError ? "bg-red-600 text-white" : "bg-green-600 text-white",
        ].join(" ")}
      >
        <p className="min-w-0 flex-1 font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={hideToast}
          className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white/90 hover:bg-white/15"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Toast;
