import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Package,
  PackageCheck,
  Truck,
  Timer,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, KpiCard } from '@/components/enterprise/OutboundUi'
import { OutboundFlowStrip } from '@/components/enterprise/OutboundFlowStrip'
import { useOutboundDashboard, useOutboundFlowSummary } from '@/hooks/useOutbound'
import { cn } from '@/lib/cn'

export function OutboundDashboardPage() {
  const nav = useNavigate()
  const { data, isLoading, isError } = useOutboundDashboard()
  const summaryQ = useOutboundFlowSummary()
  const k = data?.kpis
  const s = summaryQ.data

  const funnel = [
    { label: 'Waiting', value: k?.ordersWaiting ?? 0, color: 'bg-sky-500', to: '/outbound/orders' },
    { label: 'Allocated', value: k?.ordersAllocated ?? 0, color: 'bg-indigo-500', to: '/outbound/allocation' },
    { label: 'Picking', value: k?.picking ?? 0, color: 'bg-violet-500', to: '/outbound/picking' },
    { label: 'Packing', value: k?.packing ?? 0, color: 'bg-fuchsia-500', to: '/outbound/packing' },
    { label: 'Ready for FE', value: k?.readyForFe ?? 0, color: 'bg-emerald-500', to: '/outbound/route-bags' },
    { label: 'In route bags', value: k?.inRouteBags ?? 0, color: 'bg-teal-500', to: '/outbound/route-bags' },
    { label: 'Assigned to FE', value: k?.assignedToFe ?? 0, color: 'bg-amber-500', to: '/outbound/assign-fe' },
    { label: 'Out with FE', value: k?.outWithFe ?? 0, color: 'bg-orange-500', to: '/outbound/in-field' },
    { label: 'Delivered today', value: k?.deliveredToday ?? 0, color: 'bg-primary-600', to: '/outbound/in-field' },
  ]
  const max = Math.max(...funnel.map((f) => f.value), 1)

  const attention = [
    { label: 'Orders need allocation', count: s?.toAllocate ?? 0, to: '/outbound/allocation', icon: Package },
    { label: 'Ready to send to pick', count: s?.allocated ?? 0, to: '/outbound/waves', icon: ClipboardList },
    { label: 'Open pick exceptions', count: s?.openExceptions ?? 0, to: '/outbound/exceptions', icon: AlertTriangle },
    { label: 'Picked — need packing', count: s?.toPack ?? 0, to: '/outbound/packing', icon: PackageCheck },
    { label: 'READY — sort into bags', count: s?.readyToBag ?? 0, to: '/outbound/route-bags', icon: MapPin },
    { label: 'FEs pending check-in', count: s?.pendingFeCheckIn ?? 0, to: '/outbound/fe-checkin', icon: ShieldCheck },
    { label: 'Sealed bags to assign', count: s?.sealedBags ?? 0, to: '/outbound/assign-fe', icon: UserCheck },
    { label: 'Bags ready to release', count: s?.assignedBags ?? 0, to: '/outbound/release-fe', icon: Truck },
  ].filter((a) => a.count > 0)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Dashboard' }]} />
      <PageHeader
        title="Outbound dashboard"
        description="What needs attention now, plus the live fulfillment funnel."
      />

      <OutboundFlowStrip summary={s} />

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load KPIs.</div>
      ) : null}

      <section className="mb-6">
        <h2 className="mb-3 font-heading text-base text-slate-900">Needs attention</h2>
        {attention.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {attention.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => nav(a.to)}
                className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                  <a.icon className="h-4 w-4 text-amber-700" />
                </div>
                <p className="mt-2 font-heading text-2xl text-amber-900">{isLoading ? '—' : a.count}</p>
                <p className="mt-1 text-[11px] font-semibold text-amber-800">Go fix →</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Nothing urgent in the queues right now.
          </p>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Orders waiting" value={isLoading ? '—' : k?.ordersWaiting ?? 0} icon={ClipboardList} tone="info" onClick={() => nav('/outbound/orders?status=OPEN')} />
        <KpiCard label="Allocated" value={isLoading ? '—' : k?.ordersAllocated ?? 0} icon={Package} onClick={() => nav('/outbound/allocation')} />
        <KpiCard label="Picking" value={isLoading ? '—' : k?.picking ?? 0} icon={PackageCheck} tone="info" onClick={() => nav('/outbound/picking')} />
        <KpiCard label="Packing" value={isLoading ? '—' : k?.packing ?? 0} icon={Package} onClick={() => nav('/outbound/packing')} />
        <KpiCard label="Ready for FE" value={isLoading ? '—' : k?.readyForFe ?? 0} icon={CheckCircle2} tone="success" onClick={() => nav('/outbound/route-bags')} />
        <KpiCard label="Assigned to FE" value={isLoading ? '—' : k?.assignedToFe ?? 0} icon={UserCheck} tone="warn" onClick={() => nav('/outbound/assign-fe')} />
        <KpiCard label="Out with FE" value={isLoading ? '—' : k?.outWithFe ?? 0} icon={Truck} tone="info" onClick={() => nav('/outbound/in-field')} />
        <KpiCard label="SLA breaches" value={isLoading ? '—' : k?.slaBreaches ?? 0} icon={Timer} tone="danger" onClick={() => nav('/outbound/orders')} />
        <KpiCard label="Open exceptions" value={isLoading ? '—' : k?.exceptionsOpen ?? 0} icon={AlertTriangle} tone="warn" onClick={() => nav('/outbound/exceptions')} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="surface-card p-5 lg:col-span-3">
          <h2 className="font-heading text-base text-slate-900">Fulfillment funnel</h2>
          <div className="mt-5 space-y-3">
            {funnel.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => nav(f.to)}
                className="grid w-full grid-cols-[7rem_1fr_2rem] items-center gap-3 text-left text-sm hover:opacity-90"
              >
                <span className="text-slate-600">{f.label}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', f.color)}
                    style={{ width: `${(f.value / max) * 100}%` }}
                  />
                </div>
                <span className="text-right font-semibold text-slate-800">{f.value}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="surface-card p-5 lg:col-span-2">
          <h2 className="font-heading text-base text-slate-900">Recent activity</h2>
          <ul className="mt-4 space-y-3">
            {(data?.activity ?? []).slice(0, 8).map((a) => (
              <li key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                <p className="text-sm text-slate-800">{a.message}</p>
                <p className="mt-1 text-[11px] text-slate-400">{new Date(a.at).toLocaleString()}</p>
              </li>
            ))}
            {!data?.activity?.length && !isLoading ? (
              <li className="text-sm text-slate-500">No recent activity</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  )
}
