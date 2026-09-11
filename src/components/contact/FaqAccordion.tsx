"use client";

import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Do you ship pan-India?",
    answer: "Yes, we ship across India. Shipping estimates are shown at checkout.",
  },
  {
    question: "Are your prices inclusive of GST?",
    answer:
      "Product prices are shown inclusive of applicable GST unless stated otherwise on the product page.",
  },
  {
    question: "How do I place a wholesale or export order?",
    answer:
      "Use the Wholesale or Export enquiry forms with your requirement, and our team will follow up with terms and next steps.",
  },
  {
    question: "What is your return policy?",
    answer:
      "See our Cancellation & Refunds policy page for current details. Food items follow standard quality-issue return handling.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {FAQS.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.question} className="p-5">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between text-left text-sm font-semibold text-foreground"
              aria-expanded={open}
            >
              {faq.question}
              <span className="ml-4 text-foreground-muted">{open ? "−" : "+"}</span>
            </button>
            {open ? (
              <p className="mt-2 text-sm text-foreground-muted">{faq.answer}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
