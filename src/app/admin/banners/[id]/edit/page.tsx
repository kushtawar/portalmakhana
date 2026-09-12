import { notFound } from "next/navigation";
import BannerForm from "@/app/admin/banners/BannerForm";
import { getBannerById } from "@/lib/db/banners";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">Edit banner</h1>
      <div className="mt-6">
        <BannerForm banner={banner} />
      </div>
    </div>
  );
}
