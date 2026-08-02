import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import { formatMoney } from '@/lib/cn'

export function KpiDashboardPage() {
  const snap = reportsAdminService.kpiSnapshot()

  const highlights = [
    { label: 'Total orders today', value: snap.ordersToday.toLocaleString('en-IN'), to: '/reports/orders' },
    {
      label: 'Orders dispatched',
      value: snap.ordersDispatched.toLocaleString('en-IN'),
      to: '/reports/outbound',
    },
    {
      label: 'Goods received',
      value: snap.goodsReceived.toLocaleString('en-IN'),
      to: '/reports/inbound',
    },
    {
      label: 'Inventory accuracy',
      value: `${snap.inventoryAccuracyPct}%`,
      to: '/reports/inventory',
    },
    {
      label: 'Average pick time',
      value: snap.avgPickTimeLabel,
      to: '/reports/warehouse-performance',
    },
    {
      label: 'Warehouse revenue',
      value: formatMoney(snap.warehouseRevenue),
      to: '/reports/financial',
    },
    {
      label: 'Low stock SKUs',
      value: String(snap.lowStockSkus),
      to: '/reports/inventory',
    },
    {
      label: 'Dead stock value',
      value: formatMoney(snap.deadStockValue),
      to: '/reports/dead-stock',
    },
  ] as const

  const operational = [
    { label: 'Fill rate', value: `${snap.fillRatePct}%` },
    { label: 'Order accuracy', value: `${snap.orderAccuracyPct}%` },
    { label: 'Picking accuracy', value: `${snap.pickingAccuracyPct}%` },
    { label: 'Packing accuracy', value: `${snap.packingAccuracyPct}%` },
    { label: 'Dispatch SLA', value: `${snap.dispatchSlaPct}%`, to: '/reports/sla' },
    { label: 'Return rate', value: `${snap.returnRatePct}%` },
    { label: 'RTO rate', value: `${snap.rtoRatePct}%` },
  ] as const

  const executive = [
    { label: 'Customer satisfaction', value: `${snap.customerSatisfaction} / 5` },
    { label: 'Warehouse utilization', value: `${snap.warehouseUtilizationPct}%` },
    { label: 'Revenue growth', value: `${snap.revenueGrowthPct}%` },
    { label: 'Cost per order', value: formatMoney(snap.costPerOrder) },
  ] as const

  return (
    <div>
      <PageHeader
        title="KPI Dashboard"
        description="Operational and executive metrics across inventory, orders, SLA, and finance."
      />

      <h2 className="mb-2 font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">
        Dashboard highlights
      </h2>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <Link
            key={h.label}
            to={h.to}
            className="surface-panel block p-4 transition hover:ring-2 hover:ring-sky-200"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{h.label}</p>
            <p className="mt-1 font-heading text-xl font-semibold text-slate-900">{h.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Operational KPIs</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {operational.map((k) => (
              <div key={k.label} className="flex justify-between border-b border-slate-50 pb-2">
                <dt className="text-slate-500">
                  {'to' in k && k.to ? (
                    <Link to={k.to} className="text-sky-700 hover:underline">
                      {k.label}
                    </Link>
                  ) : (
                    k.label
                  )}
                </dt>
                <dd className="font-semibold text-slate-900">{k.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Executive KPIs</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {executive.map((k) => (
              <div key={k.label} className="flex justify-between border-b border-slate-50 pb-2">
                <dt className="text-slate-500">{k.label}</dt>
                <dd className="font-semibold text-slate-900">{k.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link to="/reports/sla" className="text-sky-700 hover:underline">
              SLA dashboards
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/reports/ageing" className="text-sky-700 hover:underline">
              Ageing
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/reports/dead-stock" className="text-sky-700 hover:underline">
              Dead stock
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
