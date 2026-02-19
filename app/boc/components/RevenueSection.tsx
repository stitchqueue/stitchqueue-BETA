"use client";

import { useState, useEffect } from "react";
import { getRevenueData, type RevenueData } from "../../lib/storage/boc-performance";

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RevenueSection() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenueData()
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-line rounded-xl p-6 text-center">
        <p className="text-sm text-muted animate-pulse">Loading revenue data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-line rounded-xl p-6 text-center">
        <p className="text-sm text-muted">No revenue data yet.</p>
      </div>
    );
  }

  const diff = data.thisMonthRevenue - data.lastMonthRevenue;
  const diffAbs = Math.abs(diff);

  return (
    <div className="bg-white border border-line rounded-xl p-6">
      <h3 className="text-lg font-bold text-plum mb-4">Revenue</h3>

      {/* Primary: this month's received revenue */}
      <div className="mb-4">
        <p className="text-3xl font-bold" style={{ color: "#98823a" }}>
          {fmtCurrency(data.thisMonthRevenue)}
        </p>
        <p className="text-sm text-muted mt-1">received this month</p>
      </div>

      {/* Pipeline */}
      {data.pipelineRevenue > 0 && (
        <div className="mb-4">
          <p className="text-xl font-bold text-plum/80">
            {fmtCurrency(data.pipelineRevenue)}
          </p>
          <p className="text-sm text-muted mt-1">
            in pipeline (estimates + in progress + awaiting payment)
          </p>
        </div>
      )}

      {/* Month over month */}
      <div className="border-t border-line pt-3">
        {diff > 0 ? (
          <p className="text-sm text-green-700">
            &uarr; {fmtCurrency(diffAbs)} more than last month
          </p>
        ) : diff < 0 ? (
          <p className="text-sm text-red-600">
            &darr; {fmtCurrency(diffAbs)} less than last month
          </p>
        ) : (
          <p className="text-sm text-muted">
            Same as last month
          </p>
        )}
      </div>
    </div>
  );
}
