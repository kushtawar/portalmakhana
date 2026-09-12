"use client";

import { useState, type FormEvent } from "react";
import type { EnquiryType } from "@/lib/types";

export interface EnquiryFieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "number";
  required?: boolean;
  span2?: boolean;
}

export default function EnquiryForm({
  type,
  fields,
  submitLabel = "Submit enquiry",
}: {
  type: EnquiryType;
  fields: EnquiryFieldConfig[];
  submitLabel?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      type,
      fields: fields
        .map((field) => ({
          label: field.label,
          value: String(formData.get(field.name) ?? "").trim(),
        }))
        .filter((entry) => entry.value.length > 0),
    };

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting your enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-accent-light bg-accent-light p-6 text-center">
        <p className="text-sm font-semibold text-accent">Thank you for reaching out</p>
        <p className="mt-2 text-sm text-foreground-muted">
          Our team will review your enquiry and get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <label
          key={field.name}
          className={`text-sm text-foreground-muted ${field.span2 ? "sm:col-span-2" : ""}`}
        >
          {field.label}
          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              required={field.required}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          ) : (
            <input
              name={field.name}
              required={field.required}
              type={field.type ?? "text"}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          )}
        </label>
      ))}

      {error ? <p className="text-sm text-danger sm:col-span-2">{error}</p> : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
