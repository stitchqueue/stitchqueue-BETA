"use client";

import type { ExperienceLevel } from "../../types";
import { SPH_RATES } from "../../types";
import Tooltip from "../../components/Tooltip";

interface Props {
  targetHourlyWage: string;
  onTargetHourlyWageChange: (v: string) => void;
  experienceLevel: ExperienceLevel;
  onExperienceLevelChange: (v: ExperienceLevel) => void;
  sphRate: number;
  projectsPerMonth: string;
  onProjectsPerMonthChange: (v: string) => void;
  avgProjectSize: string;
  onAvgProjectSizeChange: (v: string) => void;
}

const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "novice", label: "Novice" },
  { value: "experienced", label: "Experienced" },
  { value: "expert", label: "Expert" },
];

export default function RateCalculatorSection({
  targetHourlyWage,
  onTargetHourlyWageChange,
  experienceLevel,
  onExperienceLevelChange,
  sphRate,
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

      {/* Experience level radio buttons */}
      <div className="mt-4">
        <label className="block text-sm font-bold text-muted mb-2">
          Experience Level
        </label>
        <div className="flex flex-wrap gap-4">
          {LEVELS.map((level) => (
            <label key={level.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={experienceLevel === level.value}
                onChange={() => onExperienceLevelChange(level.value)}
                className="accent-plum"
              />
              <span className="text-sm">
                {level.label}{" "}
                <span className="text-muted">
                  ({SPH_RATES[level.value].toLocaleString()} SPH)
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted mt-1">
          SPH = Stitches Per Hour — your effective quilting speed at this level.
          Currently: <strong>{sphRate.toLocaleString()} SPH</strong>
        </p>
      </div>
    </div>
  );
}
