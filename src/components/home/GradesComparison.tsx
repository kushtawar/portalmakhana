import Link from "next/link";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { listProducts } from "@/lib/db/products";
import { formatInr } from "@/lib/format";

const GRADE_NOTES = [
  {
    grade: "Silver",
    detail: "Regular grade — comparatively smaller and more mixed-size makhana, good for everyday use.",
  },
  {
    grade: "Gold",
    detail: "Premium grade — generally larger, fuller and better-selected makhana.",
  },
  {
    grade: "Diamond",
    detail: "Top premium grade — larger, more carefully selected makhana with a fuller appearance.",
  },
  {
    grade: "Handpicked",
    detail:
      "Gold and Diamond are also available Handpicked — manually filtered and selected before packing, rather than relying only on machine-based grading.",
  },
];

const attribute = (attributes: { label: string; value: string }[], label: string) =>
  attributes.find((a) => a.label === label)?.value ?? "—";

export default async function GradesComparison() {
  const makhana = (await listProducts({ category: "makhana", activeOnly: true })).sort(
    (a, b) => a.variants[0].price - b.variants[0].price
  );
  if (makhana.length === 0) return null;

  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="Choose your grade"
          title="How our Makhana grades differ"
          description="Our makhana is graded by size, appearance and overall quality, so you can pick the variety that suits your preference."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-primary-deep text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Variety</th>
                  <th className="px-4 py-3 font-semibold">Selection</th>
                  <th className="px-4 py-3 font-semibold">Price / kg</th>
                  <th className="px-4 py-3 font-semibold">Pack price</th>
                </tr>
              </thead>
              <tbody>
                {makhana.map((product) => (
                  <tr key={product.slug} className="border-t border-border even:bg-background-subtle">
                    <td className="px-4 py-3">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="font-semibold text-primary-dark hover:text-primary hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {attribute(product.attributes, "Selection")}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {attribute(product.attributes, "Price per kg")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                      {formatInr(product.variants[0].price)}
                      <span className="ml-1 text-xs font-normal text-foreground-muted">
                        / {product.variants[0].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <ul className="space-y-4">
              {GRADE_NOTES.map((note) => (
                <li key={note.grade} className="flex gap-3 text-sm">
                  <span className="mt-0.5 inline-flex h-6 shrink-0 items-center rounded-full bg-primary-light px-2.5 text-xs font-semibold text-primary-dark">
                    {note.grade}
                  </span>
                  <span className="text-foreground-muted">{note.detail}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-foreground-muted">
              Makhana is an agricultural product, so exact size can vary naturally from harvest to
              harvest — the grade is maintained through selection.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
