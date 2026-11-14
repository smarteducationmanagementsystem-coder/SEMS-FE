export function PlatformSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--admin-muted)] uppercase">Platform admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <section className="rounded-xl bg-[var(--admin-surface)] p-5 ring-1 ring-[var(--admin-line)]">
        <p className="max-w-xl text-sm text-[var(--admin-muted)]">{description}</p>
      </section>
    </div>
  );
}
