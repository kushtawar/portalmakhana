"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Promotion } from "@/lib/types";

function toLocalInputValue(iso: string): string {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function nowLocalInputValue(): string {
  return toLocalInputValue(new Date().toISOString());
}

const DURATION_PRESETS = [
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
  { label: "10 days", hours: 240 },
];

export default function PromotionForm({ promotion }: { promotion?: Promotion }) {
  const router = useRouter();
  const isEdit = Boolean(promotion);

  const [slug, setSlug] = useState(promotion?.slug ?? "");
  const [title, setTitle] = useState(promotion?.title ?? "");
  const [bannerText, setBannerText] = useState(promotion?.bannerText ?? "");
  const [description, setDescription] = useState(promotion?.description ?? "");
  const [ctaLabel, setCtaLabel] = useState(promotion?.ctaLabel ?? "Shop Now");
  const [ctaHref, setCtaHref] = useState(promotion?.ctaHref ?? "/shop");
  const [startAt, setStartAt] = useState(
    promotion ? toLocalInputValue(promotion.startAt) : nowLocalInputValue()
  );
  const [endAt, setEndAt] = useState(
    promotion ? toLocalInputValue(promotion.endAt) : nowLocalInputValue()
  );
  const [active, setActive] = useState(promotion?.active ?? true);
  const [blinkBanner, setBlinkBanner] = useState(promotion?.blinkBanner ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const applyPreset = (hours: number) => {
    const start = new Date();
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    setStartAt(toLocalInputValue(start.toISOString()));
    setEndAt(toLocalInputValue(end.toISOString()));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      slug,
      title,
      bannerText,
      description,
      ctaLabel: ctaLabel || undefined,
      ctaHref: ctaHref || undefined,
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      active,
      blinkBanner,
    };

    const url = isEdit ? `/api/promotions/${promotion!.slug}` : "/api/promotions";
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

    router.push("/admin/promotions");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Diwali Dhamaka"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted">
          Page URL (slug)
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isEdit}
            placeholder="diwali-dhamaka"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-muted"
          />
          <span className="mt-1 block text-xs text-foreground-muted">
            Will be live at /offers/{slug || "..."}
          </span>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground-muted">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (can be paused early without deleting)
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground-muted">
          <input
            type="checkbox"
            checked={blinkBanner}
            onChange={(e) => setBlinkBanner(e.target.checked)}
          />
          Blink the site-wide banner (use sparingly)
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Banner text (shown site-wide while live)
          <input
            required
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder={"Diwali Dhamaka — 20% off all Makhana, this week only!"}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>
        <label className="text-sm text-foreground-muted sm:col-span-2">
          Full details (shown on the offer page)
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-foreground">When should this run?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.hours)}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-foreground-muted hover:bg-muted"
            >
              Start now, run {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-foreground-muted">
            Starts
            <input
              required
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="text-sm text-foreground-muted">
            Ends
            <input
              required
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create promotion"}
      </button>
    </form>
  );
}
