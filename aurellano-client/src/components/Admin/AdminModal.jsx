const AdminModal = ({ open, title, onClose, children, wide = false }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-shade/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-neutral1 p-6 shadow-xl",
          wide ? "max-w-3xl" : "max-w-lg",
        ].join(" ")}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1 text-sm font-semibold text-shade hover:bg-zinc-200"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AdminModal;
