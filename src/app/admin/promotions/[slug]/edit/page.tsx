import { notFound } from "next/navigation";
import PromotionForm from "@/app/admin/promotions/PromotionForm";
import { getPromotionBySlug } from "@/lib/db/promotions";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">Edit promotion</h1>
      <div className="mt-6">
        <PromotionForm promotion={promotion} />
      </div>
    </div>
  );
}
