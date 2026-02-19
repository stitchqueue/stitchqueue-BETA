"use client";

import Tooltip from "../../components/Tooltip";

// ── SPH Slider Snap Points ──────────────────────────────────────────────────
// Beta feedback may require adjusting these values
const SPH_MIN = 1500;
const SPH_MAX = 3500;
const SPH_SNAP_POINTS = [
  { value: 1600, label: "Beginner" },
  { value: 2000, label: "Intermediate" },
  { value: 2400, label: "Advanced" },
] as const;

interface Props {
  targetHourlyWage: string;
  onTargetHourlyWageChange: (v: string) => void;
  sphRate: number;
  onSphRateChange: (v: number) => void;
  projectsPerMonth: string;
  onProjectsPerMonthChange: (v: string) => void;
  avgProjectSize: string;
  onAvgProjectSizeChange: (v: string) => void;
}

export default function RateCalculatorSection({
  targetHourlyWage,
  onTargetHourlyWageChange,
  sphRate,
  onSphRateChange,
  projectsPerMonth,
  onProjectsPerMonthChange,
  avgProjectSize,
  onAvgProjectSizeChange,
}: Props) {
  return (
    <div>
      <h3 className="text-lg font-bold text-plum mb-4">
        Wage &amp; Project Parameters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Target hourly wage */}
        <div>
          <label className="block text-sm font-bold text-muted mb-2">
            Target Hourly Wage ($){" "}
            <Tooltip content="What you want to earn per hour of quilting work, including prep time." position="right" />
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={targetHourlyWage}
            onChange={(e) => onTargetHourlyWageChange(e.target.value)}
            placeholder="e.g. 25.00"
            className="w-full px-4 py-2 border border-line rounded-xl"
          />
        </div>

        {/* Projects per month */}
        <div>
          <label className="block text-sm font-bold text-muted mb-2">
            Projects Per Month
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={projectsPerMonth}
            onChange={(e) => onProjectsPerMonthChange(e.target.value)}
            placeholder="e.g. 10"
            className="w-full px-4 py-2 border border-line rounded-xl"
          />
        </div>

        {/* Average project size */}
        <div>
          <label className="block text-sm font-bold text-muted mb-2">
            Average Project Size (sq in){" "}
            <Tooltip content="Width x Length of a typical quilt. A 60x80 quilt = 4,800 sq in." position="right" />
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={avgProjectSize}
            onChange={(e) => onAvgProjectSizeChange(e.target.value)}
            placeholder="e.g. 6000"
            className="w-full px-4 py-2 border border-line rounded-xl"
          />
        </div>
      </div>

      {/* SPH Slider */}
      <div className="mt-4">
        <label className="block text-sm font-bold text-muted mb-2">
          Quilting Speed (Stitches Per Hour)
        </label>

        <div className="px-1">
          <input
            type="range"
            min={SPH_MIN}
            max={SPH_MAX}
            step={1}
            value={sphRate}
            onChange={(e) => onSphRateChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-lg cursor-pointer accent-[#4e283a]"
          />

          {/* Snap point markers below the slider track */}
          <div className="relative w-full mt-1" style={{ height: 32 }}>
            {SPH_SNAP_POINTS.map((point) => {
              const pct =
                ((point.value - SPH_MIN) / (SPH_MAX - SPH_MIN)) * 100;
              return (
                <button
                  key={point.value}
                  type="button"
                  onClick={() => onSphRateChange(point.value)}
                  className="absolute -translate-x-1/2 text-center cursor-pointer hover:text-plum transition-colors"
                  style={{ left: `${pct}%` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-plum/40 mx-auto mb-0.5" />
                  <span className="text-xs text-muted whitespace-nowrap">
                    {point.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted mt-1">
          Currently: <strong>{sphRate.toLocaleString()} SPH</strong>
          {" · "}Drag to adjust, or click a label to snap.
        </p>
      </div>
    </div>
  );
}
