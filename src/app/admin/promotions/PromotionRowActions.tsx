"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PromotionRowActions({
  slug,
  active,
}: {
  slug: string;
  active: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const togglePause = async () => {
    setBusy(true);
    await fetch(`/api/promotions/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setBusy(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm(`Delete the "${slug}" promotion? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/promotions/${slug}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Link href={`/offers/${slug}`} target="_blank" className="font-medium text-primary hover:underline">
        View
      </Link>
      <Link href={`/admin/promotions/${slug}/edit`} className="font-medium text-primary hover:underline">
        Edit
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={togglePause}
        className="font-medium text-foreground-muted hover:text-primary disabled:opacity-50"
      >
        {active ? "Pause" : "Resume"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={remove}
        className="font-medium text-danger hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
