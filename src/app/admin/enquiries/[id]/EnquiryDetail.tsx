"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

const STATUSES: EnquiryStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST"];

export default function EnquiryDetail({ enquiry }: { enquiry: Enquiry }) {
  const router = useRouter();
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch(`/api/enquiries/${enquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-xs uppercase text-foreground-muted">
            {enquiry.type} enquiry &middot;{" "}
            {new Date(enquiry.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <dl className="mt-4 space-y-3">
            {enquiry.fields.map((field) => (
              <div key={field.label}>
                <dt className="text-xs font-medium uppercase text-foreground-muted">
                  {field.label}
                </dt>
                <dd className="mt-0.5 text-sm text-foreground">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <label className="text-sm text-foreground-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block text-sm text-foreground-muted">
          Internal notes
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full rounded-full bg-gradient-to-r from-primary to-primary-deep px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
