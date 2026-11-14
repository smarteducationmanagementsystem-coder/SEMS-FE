import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { buildBreadcrumbSchema, type BreadcrumbItem } from "@/lib/structured-data";

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => {
            const isCurrentPage = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {isCurrentPage ? (
                  <span aria-current="page" className="text-ink">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.href} className="underline-offset-4 transition-colors hover:text-ink hover:underline">
                      {item.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={buildBreadcrumbSchema(items)} />
    </>
  );
}
