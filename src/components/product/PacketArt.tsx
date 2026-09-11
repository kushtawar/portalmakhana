export type PackType = "makhana" | "masala";

export default function PacketArt({
  packType,
  label,
  className = "",
}: {
  packType: PackType;
  label: string;
  className?: string;
}) {
  const isMasala = packType === "masala";
  const gradientId = `pack-gradient-${packType}-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-background-subtle to-ivory ${className}`}
    >
      <svg
        viewBox="0 0 300 380"
        className="h-[88%] w-auto"
        role="img"
        aria-label={`${label} packet illustration`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {isMasala ? (
              <>
                <stop offset="0%" stopColor="#e8672c" />
                <stop offset="100%" stopColor="#a1300f" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#7cc142" />
                <stop offset="100%" stopColor="#3f7a1f" />
              </>
            )}
          </linearGradient>
          <linearGradient id="pack-shine" x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <ellipse cx="150" cy="362" rx="88" ry="13" fill="#000000" opacity="0.08" />

        <path
          d="M70 60 C70 40 90 25 120 25 L180 25 C210 25 230 40 230 60 L245 320 C246 340 230 355 205 355 L95 355 C70 355 54 340 55 320 Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M70 60 C70 40 90 25 120 25 L180 25 C210 25 230 40 230 60 L245 320 C246 340 230 355 205 355 L95 355 C70 355 54 340 55 320 Z"
          fill="url(#pack-shine)"
        />

        <rect x="90" y="44" width="120" height="10" rx="5" fill="#ffffff" opacity="0.55" />
        <circle cx="150" cy="49" r="4" fill="#ffffff" opacity="0.85" />

        <path d="M70 60 L54 82 L70 102 Z" fill="#000000" opacity="0.08" />
        <path d="M230 60 L246 82 L230 102 Z" fill="#000000" opacity="0.08" />

        <rect x="78" y="138" width="144" height="126" rx="16" fill="#faf7f1" opacity="0.97" />

        {isMasala ? (
          <g transform="translate(150,172)">
            <path
              d="M-15 -9 C-15 -21 -3 -27 5 -19 C15 -11 13 5 1 11 C-11 17 -15 3 -15 -9 Z"
              fill="#c1440e"
            />
            <path
              d="M5 -19 C11 -25 21 -23 21 -13"
              stroke="#5f8f52"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="-24" cy="6" r="3.5" fill="#e8672c" />
            <circle cx="20" cy="14" r="3" fill="#e8672c" />
          </g>
        ) : (
          <g transform="translate(150,172)">
            <circle cx="-11" cy="1" r="10" fill="#f5efd6" stroke="#c9b878" strokeWidth="1.5" />
            <circle cx="9" cy="-6" r="10" fill="#f5efd6" stroke="#c9b878" strokeWidth="1.5" />
            <circle cx="4" cy="12" r="10" fill="#f5efd6" stroke="#c9b878" strokeWidth="1.5" />
          </g>
        )}

        <text
          x="150"
          y="217"
          textAnchor="middle"
          fontSize="19"
          fontWeight="700"
          fill="#172433"
          fontFamily="Arial, sans-serif"
        >
          Itar<tspan fill={isMasala ? "#c1440e" : "#3f7a1f"}>Intakes</tspan>
        </text>
        <text
          x="150"
          y="238"
          textAnchor="middle"
          fontSize="11"
          fill="#5b6b7a"
          fontFamily="Arial, sans-serif"
        >
          {isMasala ? "Masala Seasoning" : "Premium Makhana"}
        </text>
        <text
          x="150"
          y="254"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill="#172433"
          fontFamily="Arial, sans-serif"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
