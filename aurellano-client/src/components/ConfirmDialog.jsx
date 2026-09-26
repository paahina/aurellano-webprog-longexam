import Button from "./Button";

const ConfirmDialog = ({
  open,
  title = "Confirm",
  message,
  confirmLabel = "Yes",
  cancelLabel = "No",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-shade/50"
        aria-label="Close confirm dialog"
        onClick={loading ? undefined : onCancel}
        disabled={loading}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative z-10 w-full max-w-md rounded-3xl bg-neutral1 p-6 shadow-xl"
      >
        <h2 id="confirm-dialog-title" className="text-xl font-bold text-primary">
          {title}
        </h2>
        {message ? <p className="mt-3 text-sm text-zinc-700">{message}</p> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="custom5" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
