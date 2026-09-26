import Link from "next/link";
import Container from "@/components/layout/Container";
import ProductImage from "@/components/product/ProductImage";

const JOURNEY = [
  { step: "Collection", detail: "Makhana seeds are collected from water bodies." },
  { step: "Cleaning", detail: "Seeds are cleaned and unwanted impurities removed." },
  { step: "Drying", detail: "Seeds are dried in suitable conditions." },
  { step: "Processing", detail: "Dried seeds are expanded through traditional heat processing." },
  { step: "Sorting", detail: "Makhana is sorted and selected by size and quality." },
  { step: "Handpicked", detail: "For premium Gold and Diamond, pieces are manually filtered." },
  { step: "Packaging", detail: "The selected product is hygienically packed." },
];

export default function OriginStory() {
  return (
    <section className="py-14">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <ProductImage
          imagePath="/products/shrestha-handpicked-diamond-makhana.jpg"
          packType="makhana"
          label="Shrestha Handpicked Diamond Makhana"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-square w-full rounded-2xl lg:order-2"
        />
        <div className="lg:order-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            The Story of Makhana
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
            From pond to packet
          </h2>
          <p className="mt-3 text-foreground-muted">
            Makhana&apos;s journey begins with the seeds of the Euryale ferox plant, which grows
            in water. Through traditional processing, these seeds become the familiar white,
            crunchy Makhana.
          </p>
          <ol className="mt-5 space-y-2.5">
            {JOURNEY.map((item, index) => (
              <li key={item.step} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-foreground-muted">
                  <span className="font-semibold text-foreground">{item.step}:</span>{" "}
                  {item.detail}
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/about"
            className="mt-5 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
          >
            About Shrestha &rarr;
          </Link>
        </div>
      </Container>
    </section>
  );
}
