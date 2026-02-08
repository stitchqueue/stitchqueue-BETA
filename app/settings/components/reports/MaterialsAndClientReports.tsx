/**
 * Materials & Client Report Display Components
 * 
 * Displays materials usage and client analytics.
 * 
 * @module settings/components/reports/MaterialsAndClientReports
 */

"use client";

import { formatCurrency, formatDate } from "./utils";

interface MaterialsReportProps {
  reportData: any;
  currencyCode: string;
}

interface ClientsReportProps {
  reportData: any;
  currencyCode: string;
}

/**
 * Materials usage report (bobbins + batting)
 */
export function MaterialsReport({
  reportData,
  currencyCode,
}: MaterialsReportProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bobbin Sales */}
        <div className="space-y-4">
          <h4 className="font-bold text-plum">🧵 Bobbin Sales</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Bobbins Sold</span>
              <span className="font-bold">{reportData.bobbinsSold || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Bobbin Revenue</span>
              <span className="font-bold">
                {formatCurrency(reportData.bobbinRevenue || 0, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Avg Price per Bobbin</span>
              <span className="font-bold">
                {(reportData.bobbinsSold || 0) > 0
                  ? formatCurrency(
                      (reportData.bobbinRevenue || 0) / reportData.bobbinsSold,
                      currencyCode
                    )
                  : "$0.00"}
              </span>
            </div>
          </div>

          {reportData.popularBobbinTypes &&
            reportData.popularBobbinTypes.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-bold text-muted mb-2">
                  Popular Bobbin Types
                </div>
                <div className="space-y-1">
                  {reportData.popularBobbinTypes.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm"
                      >
                        <span>{item.name}</span>
                        <span className="text-muted">{item.count} sold</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Batting Usage */}
        <div className="space-y-4">
          <h4 className="font-bold text-plum">🛏️ Batting Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Yards Used</span>
              <span className="font-bold">
                {(reportData.battingYardsUsed || 0).toFixed(1)} yds
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Batting Revenue</span>
              <span className="font-bold">
                {formatCurrency(reportData.battingRevenue || 0, currencyCode)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Avg Price per Yard</span>
              <span className="font-bold">
                {(reportData.battingYardsUsed || 0) > 0
                  ? formatCurrency(
                      (reportData.battingRevenue || 0) /
                        reportData.battingYardsUsed,
                      currencyCode
                    )
                  : "$0.00"}
              </span>
            </div>
          </div>

          {reportData.popularBattingTypes &&
            reportData.popularBattingTypes.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-bold text-muted mb-2">
                  Popular Batting Types
                </div>
                <div className="space-y-1">
                  {reportData.popularBattingTypes.map(
                    (item: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm"
                      >
                        <span>{item.name}</span>
                        <span className="text-muted">
                          {item.count} projects
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

/**
 * Client analysis report
 */
export function ClientsReport({
  reportData,
  currencyCode,
}: ClientsReportProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-700">
            {reportData.totalUniqueClients || 0}
          </div>
          <div className="text-blue-600 text-sm font-bold">Total Clients</div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-700">
            {(reportData.repeatClientPercentage || 0).toFixed(0)}%
          </div>
          <div className="text-green-600 text-sm font-bold">
            Repeat Clients
          </div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-700">
            {(reportData.topClientsByRevenue || []).length}
          </div>
          <div className="text-purple-600 text-sm font-bold">Top Clients</div>
        </div>
      </div>

      {/* Top Clients List */}
      <div>
        <h4 className="font-bold text-plum mb-4">Top Clients by Revenue</h4>
        <div className="space-y-2">
          {(reportData.topClientsByRevenue || []).map(
            (client: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-line rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-bold text-sm">{client.name}</div>
                  {client.email && (
                    <div className="text-xs text-muted">{client.email}</div>
                  )}
                  <div className="text-xs text-muted mt-1">
                    Last project: {formatDate(client.lastProjectDate)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {formatCurrency(client.totalRevenue || 0, currencyCode)}
                  </div>
                  <div className="text-xs text-muted">
                    {client.projectCount || 0} project
                    {(client.projectCount || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            )
          )}
          {(reportData.topClientsByRevenue || []).length === 0 && (
            <div className="text-center text-muted py-8">
              No client data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
