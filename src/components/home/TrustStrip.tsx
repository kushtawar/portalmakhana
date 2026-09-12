import Container from "@/components/layout/Container";

const POINTS = [
  {
    title: "High Protein",
    detail: "Keeps you stronger",
    icon: (
      <path
        d="M6 12h2m8 0h2M8 8v8m8-8v8M8 8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2m-8 8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Low Calories",
    detail: "Guilt-free snacking",
    icon: (
      <path
        d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Gluten Free",
    detail: "Good for everyone",
    icon: (
      <path
        d="m4 12 5 5L20 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Transparent Pricing",
    detail: "No hidden costs",
    icon: (
      <path
        d="M7 8h10M7 12h6m-6 4h10M6 4h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "GST Invoice Available",
    detail: "For businesses & bulk orders",
    icon: (
      <path
        d="M8 4h8a1 1 0 0 1 1 1v15l-3-2-2 2-2-2-3 2V5a1 1 0 0 1 1-1Zm1 5h6m-6 3h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-primary-light/60">
      <Container className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-2 lg:grid-cols-5">
        {POINTS.map((point) => (
          <div key={point.title} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                {point.icon}
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{point.title}</p>
              <p className="text-xs text-foreground-muted">{point.detail}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
