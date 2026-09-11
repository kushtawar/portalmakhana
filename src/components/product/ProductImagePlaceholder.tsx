const GRADIENTS = [
  "from-primary-light to-background-subtle",
  "from-accent-light to-ivory",
  "from-background-subtle to-ivory",
];

function hashLabel(label: string): number {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) % GRADIENTS.length;
  }
  return hash;
}

export default function ProductImagePlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  const gradient = GRADIENTS[hashLabel(label)];

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
    >
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-primary/70" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 8.5c1.8 0 3.2 1.4 3.2 3.1S13.8 14.7 12 14.7 8.8 13.3 8.8 11.6 10.2 8.5 12 8.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <p className="text-xs font-medium text-foreground-muted">{label}</p>
        <p className="text-[10px] uppercase tracking-wide text-foreground-muted/70">
          Photography coming soon
        </p>
      </div>
    </div>
  );
}
