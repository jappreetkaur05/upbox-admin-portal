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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, KpiCard } from '@/components/enterprise/OutboundUi'
import { useOutboundDashboard } from '@/hooks/useOutbound'
import { cn } from '@/lib/cn'

export function OutboundDashboardPage() {
  const nav = useNavigate()
  const { data, isLoading, isError } = useOutboundDashboard()
  const k = data?.kpis

  const funnel = [
    { label: 'Waiting', value: k?.ordersWaiting ?? 0, color: 'bg-sky-500' },
    { label: 'Allocated', value: k?.ordersAllocated ?? 0, color: 'bg-indigo-500' },
    { label: 'Picking', value: k?.picking ?? 0, color: 'bg-violet-500' },
    { label: 'Packing', value: k?.packing ?? 0, color: 'bg-fuchsia-500' },
    { label: 'Ready for FE', value: k?.readyForFe ?? 0, color: 'bg-emerald-500' },
    { label: 'In route bags', value: k?.inRouteBags ?? 0, color: 'bg-teal-500' },
    { label: 'Assigned to FE', value: k?.assignedToFe ?? 0, color: 'bg-amber-500' },
    { label: 'Out with FE', value: k?.outWithFe ?? 0, color: 'bg-orange-500' },
    { label: 'Delivered today', value: k?.deliveredToday ?? 0, color: 'bg-primary-600' },
  ]
  const max = Math.max(...funnel.map((f) => f.value), 1)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Dashboard' }]} />
      <PageHeader
        title="Outbound dashboard"
        description="Live fulfillment funnel, FE handoff pipeline, and warehouse activity."
      />

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load KPIs.</div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Orders waiting" value={isLoading ? '—' : k?.ordersWaiting ?? 0} icon={ClipboardList} tone="info" onClick={() => nav('/outbound/orders?status=OPEN')} />
        <KpiCard label="Allocated" value={isLoading ? '—' : k?.ordersAllocated ?? 0} icon={Package} onClick={() => nav('/outbound/allocation')} />
        <KpiCard label="Picking" value={isLoading ? '—' : k?.picking ?? 0} icon={PackageCheck} tone="info" onClick={() => nav('/outbound/picking')} />
        <KpiCard label="Packing" value={isLoading ? '—' : k?.packing ?? 0} icon={Package} onClick={() => nav('/outbound/packing')} />
        <KpiCard label="Ready for FE" value={isLoading ? '—' : k?.readyForFe ?? 0} icon={CheckCircle2} tone="success" onClick={() => nav('/outbound/route-bags')} />
        <KpiCard label="In route bags" value={isLoading ? '—' : k?.inRouteBags ?? 0} icon={MapPin} tone="info" onClick={() => nav('/outbound/route-bags')} />
        <KpiCard label="Assigned to FE" value={isLoading ? '—' : k?.assignedToFe ?? 0} icon={UserCheck} tone="warn" onClick={() => nav('/outbound/assign-fe')} />
        <KpiCard label="Out with FE" value={isLoading ? '—' : k?.outWithFe ?? 0} icon={Truck} tone="info" onClick={() => nav('/outbound/in-field')} />
        <KpiCard label="Delivered today" value={isLoading ? '—' : k?.deliveredToday ?? 0} icon={CheckCircle2} tone="success" onClick={() => nav('/outbound/in-field')} />
        <KpiCard label="SLA breaches" value={isLoading ? '—' : k?.slaBreaches ?? 0} icon={Timer} tone="danger" onClick={() => nav('/outbound/orders')} />
        <KpiCard label="Open exceptions" value={isLoading ? '—' : k?.exceptionsOpen ?? 0} icon={AlertTriangle} tone="warn" onClick={() => nav('/outbound/exceptions')} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="surface-card lg:col-span-3 p-5">
          <h2 className="font-heading text-base text-slate-900">Fulfillment funnel</h2>
          <div className="mt-5 space-y-3">
            {funnel.map((f) => (
              <div key={f.label} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="text-slate-600">{f.label}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', f.color)}
                    style={{ width: `${(f.value / max) * 100}%` }}
                  />
                </div>
                <span className="text-right font-semibold text-slate-800">{f.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card lg:col-span-2 p-5">
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
