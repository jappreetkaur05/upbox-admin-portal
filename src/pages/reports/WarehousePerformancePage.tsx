import { PageHeader } from '@/layout/PageHeader'
import { reportsAdminService } from '@/services/reportsAdmin.service'

function formatPickTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function WarehousePerformancePage() {
  const snap = reportsAdminService.warehousePerf()
  const maxRank = Math.max(1, ...snap.warehouseRanking.map((w) => w.value))
  const maxTrend = Math.max(1, ...snap.pickTrend)

  return (
    <div>
      <PageHeader
        title="Warehouse Performance"
        description="Space utilization, rack occupancy, pick/pack speed, dock, and workforce productivity."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Space utilization
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{snap.spaceUtilizationPct}%</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Rack occupancy
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{snap.rackOccupancyPct}%</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Avg picking time
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">
            {formatPickTime(snap.avgPickSecs)}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Packing speed
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{snap.packingPerHour}/hr</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Dock utilization
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">{snap.dockUtilizationPct}%</p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Workforce productivity
          </p>
          <p className="mt-1 font-heading text-2xl font-semibold">
            {snap.workforceProductivityPct}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Warehouse ranking</h2>
          <ul className="mt-4 space-y-3">
            {snap.warehouseRanking.map((w, i) => (
              <li key={w.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    #{i + 1} {w.label}
                  </span>
                  <span className="font-semibold">{w.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(w.value / maxRank) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Pick time trend (7 days)</h2>
          <p className="mt-0.5 text-xs text-slate-500">Average pick seconds · lower is better</p>
          <div className="mt-6 flex h-32 items-end gap-2">
            {snap.pickTrend.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-600">{v}</span>
                <div
                  className="w-full rounded-t bg-sky-500/80"
                  style={{ height: `${(v / maxTrend) * 100}%` }}
                />
                <span className="text-[10px] text-slate-400">D{i + 1}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
