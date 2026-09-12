import { notFound } from "next/navigation";
import { getEnquiryById } from "@/lib/db/enquiries";
import EnquiryDetail from "@/app/admin/enquiries/[id]/EnquiryDetail";

export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiry = await getEnquiryById(id);
  if (!enquiry) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary-dark">Enquiry</h1>
      <div className="mt-6">
        <EnquiryDetail enquiry={enquiry} />
      </div>
    </div>
  );
}
