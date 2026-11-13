export default function Loading() {
  return (
    <div aria-busy="true" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <p className="sr-only">Ачаалж байна. Loading.</p>
      <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-16 max-w-xl animate-pulse rounded bg-muted" />
      <div className="mt-8 h-24 max-w-lg animate-pulse rounded bg-muted" />
      <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
