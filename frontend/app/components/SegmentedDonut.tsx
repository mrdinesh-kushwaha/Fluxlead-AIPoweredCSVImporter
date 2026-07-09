"use client";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface SegmentedDonutProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerSublabel?: string;
}

/**
 * A multi-segment donut chart, hand-rolled in SVG. Used for "Top Skip
 * Reasons" — each skip category gets a proportional colored arc, with the
 * total count in the center.
 */
export function SegmentedDonut({
  segments,
  size = 128,
  strokeWidth = 16,
  centerLabel,
  centerSublabel,
}: SegmentedDonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  let cumulative = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const fraction = s.value / total;
      const dash = fraction * circumference;
      const gap = circumference - dash;
      const offset = -cumulative * circumference;
      cumulative += fraction;
      return { ...s, dash, gap, offset };
    });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/8"
        />
        {arcs.map((arc, idx) => (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <div className="absolute flex flex-col items-center">
        {centerLabel && (
          <span className="font-display text-2xl font-bold text-mist-100">{centerLabel}</span>
        )}
        {centerSublabel && <span className="text-[10px] text-mist-400">{centerSublabel}</span>}
      </div>
    </div>
  );
}
