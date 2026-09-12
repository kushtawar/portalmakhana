import { listAuditEvents } from "@/lib/db/audit";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  activate: "Activated",
  deactivate: "Deactivated",
  publish: "Published",
  unpublish: "Unpublished",
};

const ENTITY_LABELS: Record<string, string> = {
  product: "Product",
  promotion: "Promotion",
  banner: "Banner",
  article: "Article",
  enquiry: "Enquiry",
};

export default async function AdminAuditPage() {
  const events = await listAuditEvents(200);

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Audit Log</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Recent administrative changes across products, promotions, banners, articles and
          enquiries — most recent first.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="px-4 py-3 text-foreground-muted">
                  {new Date(event.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{event.actor}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {ACTION_LABELS[event.action] ?? event.action}
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {ENTITY_LABELS[event.entityType] ?? event.entityType}:{" "}
                  <span className="text-foreground">{event.entityLabel}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">No administrative changes recorded yet.</p>
        ) : null}
      </div>
    </div>
  );
}
