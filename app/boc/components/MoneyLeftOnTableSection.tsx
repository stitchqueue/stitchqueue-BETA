"use client";

import { useState, useEffect } from "react";
import { getPerformanceData, type PerformanceData } from "../../lib/storage/boc-performance";

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  minimumRatePerSqIn: number;
}

export default function MoneyLeftOnTableSection({ minimumRatePerSqIn }: Props) {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const end = now.toISOString().split("T")[0];
    const start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      .toISOString()
      .split("T")[0];
    getPerformanceData(start, end)
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-line rounded-xl p-6 text-center">
        <p className="text-sm text-muted animate-pulse">Calculating...</p>
      </div>
    );
  }

  // Nothing to show if no data or no target rate
  if (!data || minimumRatePerSqIn <= 0) return null;

  const targetRevenue = minimumRatePerSqIn * data.totalSqInches;
  const gap = targetRevenue - data.totalRevenue;

  if (gap <= 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-800 mb-2">Rate Check</h3>
        <p className="text-sm text-green-700">
          You&apos;re charging at or above your target rate. Great work!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-lg font-bold text-plum mb-2">Rate Check</h3>
      <p className="text-sm text-muted">
        If you&apos;d charged your target rate on your completed work this period,
        you&apos;d have earned{" "}
        <span className="font-bold text-plum">{fmtCurrency(gap)}</span> more.
      </p>
    </div>
  );
}
