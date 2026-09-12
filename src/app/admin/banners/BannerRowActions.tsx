"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BannerRowActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    await fetch(`/api/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setBusy(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Delete this banner? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Link href={`/admin/banners/${id}/edit`} className="font-medium text-primary hover:underline">
        Edit
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={toggleActive}
        className="font-medium text-foreground-muted hover:text-primary disabled:opacity-50"
      >
        {active ? "Deactivate" : "Activate"}
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
