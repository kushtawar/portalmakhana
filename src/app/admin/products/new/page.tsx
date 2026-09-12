import ProductForm from "@/app/admin/products/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">New product</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
