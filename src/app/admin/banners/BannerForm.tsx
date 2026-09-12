"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Banner } from "@/lib/types";

export default function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const isEdit = Boolean(banner);

  const [eyebrow, setEyebrow] = useState(banner?.eyebrow ?? "");
  const [headline, setHeadline] = useState(banner?.headline ?? "");
  const [subtext, setSubtext] = useState(banner?.subtext ?? "");
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "Shop Now");
  const [ctaHref, setCtaHref] = useState(banner?.ctaHref ?? "/shop");
  const [imagePath, setImagePath] = useState(banner?.imagePath ?? "");
  const [active, setActive] = useState(banner?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      placement: "home-hero" as const,
      eyebrow: eyebrow || undefined,
      headline,
      subtext,
      ctaLabel: ctaLabel || undefined,
      ctaHref: ctaHref || undefined,
      imagePath: imagePath || undefined,
      active,
    };

    const url = isEdit ? `/api/banners/${banner!.id}` : "/api/banners";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not save. Check the fields and try again."
      );
      return;
    }

    router.push("/admin/banners");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
        <p className="text-sm text-foreground-muted sm:col-span-2">
          Placement: <span className="font-medium text-foreground">Homepage hero</span>
        </p>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Eyebrow (small text above the headline)
          <input
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            placeholder="Natural · Nutritious · From Patna"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Headline
          <input
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Subtext
          <textarea
            required
            rows={3}
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Button label
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Button link
          <input
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            placeholder="/shop"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Image path (from Media Library once available; for now, a path under /public, e.g.
          /products/classic-roasted-makhana.jpg)
          <input
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
            placeholder="/products/classic-roasted-makhana.jpg"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create banner"}
      </button>
    </form>
  );
}
