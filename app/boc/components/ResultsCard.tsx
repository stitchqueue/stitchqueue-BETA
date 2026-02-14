"use client";

import type { BOCCalculationResults } from "../utils/calculations";

interface Props {
  results: BOCCalculationResults | null;
}

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtCurrency(n: number): string {
  return "$" + n.toFixed(2);
}

export default function ResultsCard({ results }: Props) {
  if (!results || !results.isValid) {
    return (
      <div className="bg-background border border-line rounded-xl p-4 sm:p-6 text-center">
        <p className="text-muted text-sm">
          Fill in the fields above to calculate your minimum rate.
        </p>
      </div>
    );
  }

  const {
    overheadPerProject,
    quiltingTimeMinutes,
    totalTimeMinutes,
    wageNeededPerProject,
    totalNeededPerProject,
    minimumRatePerSqIn,
  } = results;

  return (
    <div className="bg-background border border-line rounded-xl p-4 sm:p-6">
      <h3 className="text-lg font-bold text-plum mb-4">Your Results</h3>

      {/* Big rate display */}
      <div className="text-center mb-6">
        <div className="text-sm font-bold text-muted mb-1">
          Minimum Rate Per Square Inch
        </div>
        <div className="text-4xl font-bold text-gold">
          ${fmt(minimumRatePerSqIn, 4)}
        </div>
        <div className="text-xs text-muted mt-1">
          per sq in to cover overhead + wage
        </div>
      </div>

      {/* Math breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Overhead per project</span>
          <span className="font-medium">{fmtCurrency(overheadPerProject)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Quilting time</span>
          <span className="font-medium">{fmt(quiltingTimeMinutes, 1)} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">+ Incidentals</span>
          <span className="font-medium">{fmt(totalTimeMinutes - quiltingTimeMinutes, 1)} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total time per project</span>
          <span className="font-medium">{fmt(totalTimeMinutes, 1)} min ({fmt(totalTimeMinutes / 60, 2)} hrs)</span>
        </div>
        <hr className="border-line" />
        <div className="flex justify-between">
          <span className="text-muted">Wage needed per project</span>
          <span className="font-medium">{fmtCurrency(wageNeededPerProject)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">+ Overhead per project</span>
          <span className="font-medium">{fmtCurrency(overheadPerProject)}</span>
        </div>
        <hr className="border-line" />
        <div className="flex justify-between font-bold">
          <span className="text-plum">Total needed per project</span>
          <span className="text-plum">{fmtCurrency(totalNeededPerProject)}</span>
        </div>
      </div>
    </div>
  );
}
