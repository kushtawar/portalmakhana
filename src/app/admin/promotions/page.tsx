import Link from "next/link";
import { listPromotions } from "@/lib/db/promotions";
import PromotionRowActions from "@/app/admin/promotions/PromotionRowActions";

export const dynamic = "force-dynamic";

function statusFor(promotion: { active: boolean; startAt: string; endAt: string }) {
  if (!promotion.active) return { label: "Paused", tone: "text-foreground-muted" };
  const now = Date.now();
  const start = new Date(promotion.startAt).getTime();
  const end = new Date(promotion.endAt).getTime();
  if (now < start) return { label: "Upcoming", tone: "text-accent" };
  if (now > end) return { label: "Expired", tone: "text-foreground-muted" };
  return { label: "Live", tone: "text-primary-dark" };
}

export default async function AdminPromotionsPage() {
  const promotions = await listPromotions();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">Promotions</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Time-bound offers and announcements. Each one automatically gets its own page at
            /offers/&lt;slug&gt; and shows as a site-wide banner while it&apos;s live &mdash; no
            code changes needed.
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-deep px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          New promotion
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promotions.map((promotion) => {
              const status = statusFor(promotion);
              return (
                <tr key={promotion.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{promotion.title}</p>
                    <p className="text-xs text-foreground-muted">/offers/{promotion.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {new Date(promotion.startAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {" → "}
                    {new Date(promotion.endAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className={`px-4 py-3 font-medium ${status.tone}`}>{status.label}</td>
                  <td className="px-4 py-3 text-right">
                    <PromotionRowActions slug={promotion.slug} active={promotion.active} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {promotions.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">
            No promotions yet. Create one to run a time-bound offer or announcement.
          </p>
        ) : null}
      </div>
    </div>
  );
}
