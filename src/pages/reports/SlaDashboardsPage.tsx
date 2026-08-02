import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSlaMetrics } from '@/hooks/useReportsAdmin'
import { SLA_AREA_LABELS } from '@/types/reportsAdmin'
import { ReportFiltersBar, type ReportFiltersValue } from './ReportFiltersBar'

function SlaRing({ percent, target }: { percent: number; target: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, percent))
  const ok = percent >= target
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={ok ? '#059669' : '#d97706'}
        strokeWidth="10"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="52"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-900 text-[18px] font-bold"
      >
        {percent}%
      </text>
    </svg>
  )
}

export function SlaDashboardsPage() {
  const [filters, setFilters] = useState<ReportFiltersValue>({
    dateRange: 'this_month',
    warehouse: 'All warehouses',
  })
  const q = useSlaMetrics(filters.warehouse)

  return (
    <div>
      <PageHeader
        title="SLA Dashboards"
        description="Receiving, putaway, picking, packing, dispatch, and delivery SLA compliance."
        actions={
          <div className="flex gap-2 text-xs">
            <Link to="/reports/inbound" className="text-sky-700 hover:underline">
              Inbound
            </Link>
            <Link to="/reports/outbound" className="text-sky-700 hover:underline">
              Outbound
            </Link>
            <Link to="/reports/kpi" className="text-sky-700 hover:underline">
              KPI
            </Link>
          </div>
        }
      />

      <ReportFiltersBar value={filters} onChange={setFilters} />

      {q.isLoading ? <LoadingPanel label="Loading SLA…" /> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(q.data ?? []).map((m) => (
          <section key={m.id} className="surface-panel flex items-center gap-4 p-4">
            <SlaRing percent={m.percent} target={m.target} />
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-sm font-semibold text-slate-900">
                {SLA_AREA_LABELS[m.area]}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Target {m.target}% · {m.warehouse}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    m.percent >= m.target ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, m.percent)}%` }}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {(q.data ?? []).length === 0 && !q.isLoading ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          No SLA metrics for this warehouse filter.
        </p>
      ) : null}
    </div>
  )
}
