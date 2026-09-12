import PromotionForm from "@/app/admin/promotions/PromotionForm";

export default function NewPromotionPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">New promotion</h1>
      <div className="mt-6">
        <PromotionForm />
      </div>
    </div>
  );
}
