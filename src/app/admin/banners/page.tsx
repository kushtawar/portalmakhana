import Link from "next/link";
import { listBanners } from "@/lib/db/banners";
import BannerRowActions from "@/app/admin/banners/BannerRowActions";

export const dynamic = "force-dynamic";

const PLACEMENT_LABELS: Record<string, string> = {
  "home-hero": "Homepage hero",
};

export default async function AdminBannersPage() {
  const banners = await listBanners();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">Banners</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Change homepage messaging and imagery without a deploy. Only one banner per
            placement is shown — the most recently updated active one wins.
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-deep px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        >
          New banner
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-foreground-muted">
            <tr>
              <th className="px-4 py-3">Placement</th>
              <th className="px-4 py-3">Headline</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td className="px-4 py-3 text-foreground-muted">
                  {PLACEMENT_LABELS[banner.placement] ?? banner.placement}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{banner.headline}</td>
                <td
                  className={`px-4 py-3 font-medium ${
                    banner.active ? "text-primary-dark" : "text-foreground-muted"
                  }`}
                >
                  {banner.active ? "Active" : "Inactive"}
                </td>
                <td className="px-4 py-3 text-right">
                  <BannerRowActions id={banner.id} active={banner.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {banners.length === 0 ? (
          <p className="p-6 text-sm text-foreground-muted">
            No banners yet — the homepage hero currently shows its built-in default content. Click &ldquo;New banner&rdquo; to change the hero image or text; the form starts pre-filled with what is live now.
          </p>
        ) : null}
      </div>
    </div>
  );
}
