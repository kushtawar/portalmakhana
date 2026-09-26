"use client";

import Image from "next/image";
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploadError(null);
    setUploading(true);

    const body = new FormData();
    body.append("file", file);
    body.append("folder", "banners");

    try {
      const res = await fetch("/api/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImagePath(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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
      // Sent as "" (not undefined) on removal so the PATCH actually clears it.
      imagePath,
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
          Hero image
          <div className="mt-1 flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
            <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
              {imagePath ? (
                <Image src={imagePath} alt="Hero preview" fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-foreground-muted">
                  Default image
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file);
                }}
                className="block w-full cursor-pointer text-sm text-foreground-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-foreground-muted">
                JPEG, PNG or WebP, up to 5MB. A landscape image around 1200×900 works best.
              </p>
              {uploading ? <p className="mt-1 text-xs text-primary">Uploading...</p> : null}
              {uploadError ? <p className="mt-1 text-xs text-danger">{uploadError}</p> : null}
              {imagePath ? (
                <button
                  type="button"
                  onClick={() => setImagePath("")}
                  className="mt-1 text-xs font-medium text-danger underline"
                >
                  Remove image (use default)
                </button>
              ) : null}
            </div>
          </div>
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground-muted">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create banner"}
      </button>
    </form>
  );
}
