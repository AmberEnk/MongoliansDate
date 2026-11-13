import { useId } from "react";
import { cn } from "cn";
import type { CategoryId } from "@/lib/demo-data";

const paper = "#f3eadf";
const sand = "#e7d5c4";
const clay = "#9a5b45";
const wool = "#5c4033";

export function Textile({
  kind,
  className,
}: {
  kind: CategoryId;
  className?: string;
}) {
  const id = `weave-${useId().replace(/:/g, "")}`;

  return (
    <svg
      viewBox="0 0 200 260"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      <rect width="200" height="260" fill={paper} />
      {kind === "cashmere" ? (
        <Cashmere id={id} />
      ) : kind === "wool" ? (
        <Wool />
      ) : kind === "felt" ? (
        <Felt id={id} />
      ) : kind === "leather" ? (
        <Leather />
      ) : kind === "ceramics" ? (
        <Ceramics />
      ) : kind === "jewelry" ? (
        <Jewelry id={id} />
      ) : kind === "wood" ? (
        <Wood />
      ) : (
        <HomeCloth id={id} />
      )}
    </svg>
  );
}

function Cashmere({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={id} width="12" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M0 8 Q6 0 12 8"
            fill="none"
            stroke={wool}
            strokeWidth="1.15"
          />
        </pattern>
      </defs>
      <rect width="200" height="260" fill={sand} />
      <rect width="200" height="260" fill={`url(#${id})`} />
    </>
  );
}

function Wool() {
  return (
    <g stroke={wool} strokeWidth="8">
      {Array.from({ length: 10 }, (_, index) => (
        <line
          key={index}
          x1="0"
          x2="200"
          y1={18 + index * 24}
          y2={18 + index * 24}
          opacity={index % 2 === 0 ? 0.85 : 0.35}
        />
      ))}
    </g>
  );
}

function Felt({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="14" r="10" fill={sand} />
          <circle cx="24" cy="22" r="8" fill={clay} opacity="0.35" />
        </pattern>
      </defs>
      <rect width="200" height="260" fill={`url(#${id})`} />
    </>
  );
}

function Leather() {
  return (
    <>
      <rect x="16" y="16" width="168" height="228" fill={sand} />
      <rect
        x="28"
        y="28"
        width="144"
        height="204"
        fill="none"
        stroke={wool}
        strokeWidth="1.25"
        strokeDasharray="3 4"
      />
    </>
  );
}

function Ceramics() {
  return (
    <g fill="none" stroke={clay} strokeWidth="1.25">
      {Array.from({ length: 7 }, (_, index) => (
        <ellipse
          key={index}
          cx="100"
          cy="168"
          rx={28 + index * 16}
          ry={16 + index * 10}
        />
      ))}
    </g>
  );
}

function Jewelry({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="2.2" fill={wool} />
        </pattern>
      </defs>
      <rect width="200" height="260" fill={sand} />
      <rect width="200" height="260" fill={`url(#${id})`} />
      <circle
        cx="100"
        cy="120"
        r="36"
        fill="none"
        stroke={clay}
        strokeWidth="1.5"
      />
    </>
  );
}

function Wood() {
  return (
    <g fill="none" stroke={wool} strokeWidth="1.2">
      {Array.from({ length: 9 }, (_, index) => (
        <path
          key={index}
          d={`M0 ${28 + index * 26} C 40 ${16 + index * 26}, 80 ${40 + index * 26}, 120 ${28 + index * 26} S 180 ${16 + index * 26}, 200 ${28 + index * 26}`}
          opacity={0.45 + (index % 3) * 0.15}
        />
      ))}
    </g>
  );
}

function HomeCloth({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 10 H20 M10 0 V20" stroke={clay} strokeWidth="0.7" />
        </pattern>
      </defs>
      <rect width="200" height="260" fill={`url(#${id})`} />
      <rect
        x="18"
        y="18"
        width="164"
        height="224"
        fill="none"
        stroke={wool}
        strokeWidth="1.25"
      />
    </>
  );
}

export function Meander({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      className={cn("h-3 w-full text-wool", className)}
      aria-hidden="true"
    >
      <path
        d="M0 9 H8 V3 H16 V9 H24 V3 H32 V9 H40 V3 H48 V9 H56 V3 H64 V9 H72 V3 H80 V9 H88 V3 H96 V9 H104 V3 H112 V9 H120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}
