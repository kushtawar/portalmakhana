import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductImage from "@/components/product/ProductImage";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Shrestha, from the ItarIntakes group, brings carefully selected, hygienically packed Makhana and spices to your table.",
};

export default function AboutPage() {
  return (
    <Container className="py-12">
      <SectionHeading eyebrow="About Us" title="Shrestha – Healthy Food, Healthy Life" />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4 text-sm leading-relaxed text-foreground-muted">
          <p>
            Shrestha is a product line from the ItarIntakes group, based in Patna. Our aim is to
            bring traditional Indian food products to customers with quality-focused selection,
            careful processing and hygienic packaging.
          </p>
          <p>
            Our Makhana range comes in Silver, Gold and Diamond. Regular Makhana is prepared and
            sorted with processing machinery and then packed. For Gold and Diamond we also offer
            a premium Handpicked option: the selected Makhana is manually filtered and sorted,
            less-suitable pieces are set aside, and only the selected Makhana is packed.
          </p>
          <p>
            Alongside Makhana, the Shrestha spice range covers everyday essentials for Indian
            cooking — Haldi, Dhaniya and Mircha powders.
          </p>
          <p className="font-semibold text-primary-dark">
            &ldquo;Quality, careful selection and hygienic packaging — with every Shrestha
            product.&rdquo;
          </p>
        </div>
        <ProductImage
          imagePath="/products/shrestha-hero.jpg"
          packType="makhana"
          label="Shrestha Handpicked Gold and Diamond Makhana"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/3] w-full rounded-2xl"
        />
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Quality Selection", detail: "Silver, Gold and Diamond grades, each carefully selected." },
          { title: "Consistency", detail: "The same standard of selection in every pack." },
          { title: "Hygienic Packaging", detail: "Every product is hygienically packed for everyday use." },
          { title: "Customer Trust", detail: "Clear grades, clear prices and honest product details." },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border p-6">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="mt-2 text-sm text-foreground-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
