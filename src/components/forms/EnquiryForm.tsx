"use client";

import { useState, type FormEvent } from "react";

export interface EnquiryFieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "number";
  required?: boolean;
  span2?: boolean;
}

export default function EnquiryForm({
  fields,
  submitLabel = "Submit enquiry",
}: {
  fields: EnquiryFieldConfig[];
  submitLabel?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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
              required={field.required}
              rows={4}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          ) : (
            <input
              required={field.required}
              type={field.type ?? "text"}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          )}
        </label>
      ))}

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
