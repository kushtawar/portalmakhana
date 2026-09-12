import Link from "next/link";
import { listEnquiries } from "@/lib/db/enquiries";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  NEW: "text-primary-dark",
  CONTACTED: "text-accent",
  QUALIFIED: "text-accent",
  QUOTED: "text-accent",
  WON: "text-primary-dark",
  LOST: "text-foreground-muted",
};

export default async function AdminEnquiriesPage() {
  const enquiries = await listEnquiries();

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">
          Wholesale &amp; Export Enquiries
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Leads submitted from the Wholesale and Export pages.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enquiries.map((enquiry) => (
              <tr key={enquiry.id}>
                <td className="px-4 py-3 font-medium text-foreground">
                  {enquiry.fields[0]?.value ?? "—"}
                </td>
                <td className="px-4 py-3 capitalize text-foreground-muted">{enquiry.type}</td>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(enquiry.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className={`px-4 py-3 font-medium ${STATUS_TONE[enquiry.status]}`}>
                  {enquiry.status}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {enquiries.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">No enquiries yet.</p>
        ) : null}
      </div>
    </div>
  );
}
