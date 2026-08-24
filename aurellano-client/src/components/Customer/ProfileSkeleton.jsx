const FieldSkeleton = () => (
  <div className="space-y-2">
    <div className="h-3 w-20 rounded bg-zinc-200" />
    <div className="h-11 w-full rounded-xl bg-zinc-200" />
  </div>
);

const ProfileSkeleton = () => {
  return (
    <div
      className="mx-auto w-full max-w-3xl animate-pulse px-4 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="h-3 w-20 rounded bg-zinc-200" />
      <div className="mt-3 h-9 w-40 rounded bg-zinc-200" />

      <section className="mt-6 rounded-3xl bg-zinc-100 p-6">
        <div className="h-6 w-44 rounded bg-zinc-200" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <div className="mt-4">
          <FieldSkeleton />
        </div>
        <div className="mt-4 h-10 w-40 rounded-full bg-zinc-200" />
      </section>

      <section className="mt-6 rounded-3xl bg-zinc-100 p-6">
        <div className="h-6 w-44 rounded bg-zinc-200" />
        <div className="mt-4">
          <FieldSkeleton />
        </div>
        <div className="mt-4">
          <FieldSkeleton />
        </div>
        <div className="mt-4 h-10 w-40 rounded-full bg-zinc-200" />
      </section>

      <section className="mt-6 rounded-3xl bg-zinc-100 p-6">
        <div className="h-10 w-full rounded-xl bg-zinc-200" />
      </section>
    </div>
  );
};

export default ProfileSkeleton;
