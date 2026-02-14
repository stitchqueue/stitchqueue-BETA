"use client";

import { useState, useEffect } from "react";
import { getPerformanceData, type PerformanceData } from "../../lib/storage/boc-performance";

interface Props {
  targetHourlyWage: number;
  sphRate: number;
  incidentalsMinutes: number;
  monthlyOverhead: number;
  minimumRatePerSqIn: number;
}

export default function PerformanceDashboard({
  targetHourlyWage,
  sphRate,
  incidentalsMinutes,
  monthlyOverhead,
  minimumRatePerSqIn,
}: Props) {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Last 3 months
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      try {
        const result = await getPerformanceData(startStr, endStr);
        setData(result);
      } catch (err) {
        console.error("Error loading performance data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-background border border-line rounded-xl p-4 sm:p-6 text-center">
        <p className="text-muted text-sm">Loading performance data...</p>
      </div>
    );
  }

  if (!data || data.projectCount === 0) {
    return (
      <div className="bg-background border border-line rounded-xl p-4 sm:p-6 text-center">
        <div className="text-3xl mb-2">📊</div>
        <p className="font-bold text-plum text-sm mb-1">No performance data yet</p>
        <p className="text-muted text-sm">
          Complete and archive projects to see your actual hourly rate compared to your target here.
        </p>
      </div>
    );
  }

  // Estimate hours: for each project, quilting time + incidentals
  // Average sq in per project = totalSqInches / projectCount
  // Quilting minutes per project = (avgSqIn / sphRate) * 60
  // Total minutes per project = quiltingMin + incidentalsMin
  // Total hours = (totalMinPerProject * projectCount) / 60
  const avgSqIn = data.totalSqInches / data.projectCount;
  const quiltingMinPerProject = sphRate > 0 ? (avgSqIn / sphRate) * 60 : 0;
  const totalMinPerProject = quiltingMinPerProject + incidentalsMinutes;
  const estimatedHours = (totalMinPerProject * data.projectCount) / 60;

  // Actual hourly rate
  const actualHourlyRate = estimatedHours > 0
    ? data.totalRevenue / estimatedHours
    : 0;

  // Comparison to target
  const isUndercharging = targetHourlyWage > 0 && actualHourlyRate < targetHourlyWage;
  const underchargePercent = targetHourlyWage > 0
    ? ((targetHourlyWage - actualHourlyRate) / targetHourlyWage) * 100
    : 0;
  const moneyLeftOnTable = isUndercharging
    ? (targetHourlyWage - actualHourlyRate) * estimatedHours
    : 0;

  // Recommended rate increase
  const recommendedRate = minimumRatePerSqIn > 0 && data.actualRatePerSqIn < minimumRatePerSqIn
    ? minimumRatePerSqIn
    : 0;
  const rateIncreasePercent = data.actualRatePerSqIn > 0 && recommendedRate > 0
    ? ((recommendedRate - data.actualRatePerSqIn) / data.actualRatePerSqIn) * 100
    : 0;

  return (
    <div className="bg-background border border-line rounded-xl p-4 sm:p-6">
      <h3 className="text-lg font-bold text-plum mb-4">
        Your Actual Performance (Last 3 Months)
      </h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-plum">{data.projectCount}</div>
          <div className="text-xs text-muted">Projects completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-plum">
            ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-muted">Total revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-plum">
            {estimatedHours.toFixed(1)} hrs
          </div>
          <div className="text-xs text-muted">Estimated hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-plum">
            ${data.actualRatePerSqIn.toFixed(4)}
          </div>
          <div className="text-xs text-muted">Actual rate/sq in</div>
        </div>
      </div>

      {/* Big hourly rate comparison */}
      <div className="bg-white border border-line rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-4 text-center">
          <div>
            <div className="text-sm font-bold text-muted mb-1">Your Actual Hourly Rate</div>
            <div className={`text-3xl font-bold ${isUndercharging ? "text-red-600" : "text-green-600"}`}>
              ${actualHourlyRate.toFixed(2)}/hr
            </div>
          </div>
          <div className="text-2xl text-muted hidden sm:block">vs</div>
          <div>
            <div className="text-sm font-bold text-muted mb-1">Target Rate</div>
            <div className="text-3xl font-bold text-plum">
              ${targetHourlyWage.toFixed(2)}/hr
            </div>
          </div>
        </div>
      </div>

      {/* Warning if undercharging */}
      {isUndercharging && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 font-bold text-sm">
            You&apos;re undercharging by {underchargePercent.toFixed(0)}%
          </p>
          <p className="text-red-600 text-sm mt-1">
            Money left on the table: ${moneyLeftOnTable.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} over the last 3 months
          </p>
        </div>
      )}

      {/* Recommended action */}
      {recommendedRate > 0 && rateIncreasePercent > 0 && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4">
          <p className="text-sm font-bold text-plum">Recommended Action</p>
          <p className="text-sm text-muted mt-1">
            Increase from ${data.actualRatePerSqIn.toFixed(4)}/sq in to ${recommendedRate.toFixed(4)}/sq in (+{rateIncreasePercent.toFixed(0)}%)
          </p>
        </div>
      )}
    </div>
  );
}
