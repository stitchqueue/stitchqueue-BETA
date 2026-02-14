"use client";

import { useState, useEffect } from "react";
// jsPDF loaded dynamically when PDF generation is triggered
import {
  getDonatedQuiltsData,
  getDonationRecords,
  type DonatedQuiltsData,
} from "../../lib/storage/boc-donations";

interface Props {
  sphRate: number;
  incidentalsMinutes: number;
  targetHourlyWage: number;
}

function fmtCurrency(n: number): string {
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function DonatedQuiltsSection({
  sphRate,
  incidentalsMinutes,
  targetHourlyWage,
}: Props) {
  const [data, setData] = useState<DonatedQuiltsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      // Last 12 months
      const end = new Date();
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);

      try {
        const result = await getDonatedQuiltsData(startStr, endStr);
        setData(result);
      } catch (err) {
        console.error("Error loading donation data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Estimate donated hours
  const estimatedHours = (() => {
    if (!data || data.totalSqInches === 0 || sphRate === 0) return 0;
    const avgSqIn = data.totalSqInches / data.totalProjects;
    const quiltingMin = (avgSqIn / sphRate) * 60;
    const totalMinPerProject = quiltingMin + incidentalsMinutes;
    return (totalMinPerProject * data.totalProjects) / 60;
  })();

  // Revenue percentage donated
  const revenuePercent = (() => {
    if (!data || targetHourlyWage === 0 || estimatedHours === 0) return 0;
    const potentialRevenue = targetHourlyWage * estimatedHours;
    return (data.totalValueDonated / potentialRevenue) * 100;
  })();

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);
      const year = end.getFullYear();

      const records = await getDonationRecords(startStr, endStr);
      if (records.length === 0) return;

      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = margin;

      // Title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`CHARITABLE DONATION SUMMARY - ${year}`, margin, y);
      y += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date().toLocaleDateString()} | Period: ${startStr} to ${endStr}`,
        margin,
        y
      );
      y += 8;

      // Horizontal rule
      doc.setDrawColor(78, 40, 58); // plum
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Group records by organization
      const byOrg = new Map<string, typeof records>();
      for (const rec of records) {
        const existing = byOrg.get(rec.clientName) || [];
        existing.push(rec);
        byOrg.set(rec.clientName, existing);
      }

      let grandTotalValue = 0;

      for (const [orgName, orgRecords] of byOrg) {
        // Check page break
        if (y > 250) {
          doc.addPage();
          y = margin;
        }

        // Org header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(orgName, margin, y);
        y += 7;

        let orgTotal = 0;

        for (const rec of orgRecords) {
          if (y > 265) {
            doc.addPage();
            y = margin;
          }

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");

          const dateStr = new Date(rec.deliveryDate).toLocaleDateString();
          const sqFt = rec.sqInches > 0 ? (rec.sqInches / 144).toFixed(1) : "N/A";
          doc.text(
            `  ${dateStr}  |  ${sqFt} sq ft  |  Service value: $${rec.value.toFixed(2)}`,
            margin,
            y
          );
          y += 5;

          orgTotal += rec.value;
        }

        // Org subtotal
        doc.setFont("helvetica", "bold");
        doc.text(
          `  Subtotal: $${orgTotal.toFixed(2)} (${orgRecords.length} quilt${orgRecords.length !== 1 ? "s" : ""})`,
          margin,
          y
        );
        y += 10;

        grandTotalValue += orgTotal;
      }

      // Grand total
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      doc.setDrawColor(78, 40, 58);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        `TOTAL SERVICE VALUE DONATED: $${grandTotalValue.toFixed(2)}`,
        margin,
        y
      );
      y += 12;

      // IRS disclaimer
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      const disclaimer = [
        "IMPORTANT: The service value of donated quilting labor is generally NOT tax deductible under IRS rules.",
        "Only out-of-pocket expenses (materials, mileage at the IRS standard rate) may qualify as charitable deductions.",
        "This summary is for recordkeeping purposes only. Consult a qualified tax professional for advice.",
      ];
      for (const line of disclaimer) {
        if (y > 280) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 4;
      }

      doc.save(`charitable-donations-${year}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background border border-line rounded-xl p-4 sm:p-6 text-center">
        <p className="text-muted text-sm">Loading donation data...</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-background border border-line rounded-xl p-4 sm:p-6">
      <h3 className="text-lg font-bold text-plum mb-4">
        Donated Quilts (Last 12 Months)
      </h3>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-plum">{data.totalProjects}</div>
          <div className="text-xs text-muted">Total projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-plum">
            {fmtCurrency(data.totalValueDonated)}
          </div>
          <div className="text-xs text-muted">Total value donated</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white border border-line rounded-xl p-4 mb-4 space-y-3 text-sm">
        {/* Charitable */}
        {data.charitableCount > 0 && (
          <div>
            <div className="font-bold text-plum">
              Charitable (Tax Benefit): {data.charitableCount} quilt
              {data.charitableCount !== 1 ? "s" : ""},{" "}
              {fmtCurrency(data.charitableValue)} value
            </div>
            <div className="ml-4 mt-1 text-muted">
              <p>
                Service Value: {fmtCurrency(data.charitableValue)}{" "}
                <span className="text-red-500 text-xs font-medium">
                  (NOT deductible)
                </span>
              </p>
              <p className="text-xs mt-1">
                Out-of-pocket expenses (materials, mileage) may be deductible — track these in your records.
              </p>
            </div>
          </div>
        )}

        {/* Gifts */}
        {data.giftCount > 0 && (
          <div>
            <div className="font-bold text-plum">
              Gifts (Friends/Family): {data.giftCount} quilt
              {data.giftCount !== 1 ? "s" : ""},{" "}
              {fmtCurrency(data.giftValue)} value
            </div>
            <div className="ml-4 mt-1 text-muted text-xs">
              No tax benefit
            </div>
          </div>
        )}
      </div>

      {/* By Organization */}
      {data.byOrganization.length > 0 && (
        <div className="bg-white border border-line rounded-xl p-4 mb-4">
          <div className="text-sm font-bold text-plum mb-2">By Organization</div>
          <div className="space-y-1">
            {data.byOrganization.map((org) => (
              <div key={org.name} className="flex justify-between text-sm">
                <span className="text-muted">{org.name}</span>
                <span className="font-medium">
                  {org.count} quilt{org.count !== 1 ? "s" : ""},{" "}
                  {fmtCurrency(org.totalValue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      {(estimatedHours > 0 || revenuePercent > 0) && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-4 text-sm">
          <div className="font-bold text-plum mb-1">Insights</div>
          {estimatedHours > 0 && (
            <p className="text-muted">
              That&apos;s an estimated {estimatedHours.toFixed(1)} hours of work
              given away.
            </p>
          )}
          {revenuePercent > 0 && (
            <p className="text-muted">
              You donated {revenuePercent.toFixed(1)}% of your potential revenue
              this year.
            </p>
          )}
        </div>
      )}

      {/* Download PDF button */}
      {data.charitableCount > 0 && (
        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="w-full bg-plum text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {generating ? "Generating PDF..." : "Download Tax Summary PDF"}
        </button>
      )}
    </div>
  );
}
