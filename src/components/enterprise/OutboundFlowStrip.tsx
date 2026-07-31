import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { OutboundFlowSummary } from '@/types/outbound'

type Stage = {
  to: string
  label: string
  count?: number
}

const WAREHOUSE: { key: keyof OutboundFlowSummary | null; to: string; label: string }[] = [
  { key: 'openOrders', to: '/outbound/orders', label: 'Orders' },
  { key: 'toAllocate', to: '/outbound/allocation', label: 'Allocation' },
  { key: 'allocated', to: '/outbound/waves', label: 'Send to pick' },
  { key: 'openPickStops', to: '/outbound/picking', label: 'Picking' },
  { key: 'toPack', to: '/outbound/packing', label: 'Packing' },
  { key: 'toLabel', to: '/outbound/labels', label: 'Labels' },
  { key: 'readyToBag', to: '/outbound/route-bags', label: 'Route bags' },
]

const FE_HANDOFF: { key: keyof OutboundFlowSummary | null; to: string; label: string }[] = [
  { key: 'pendingFeCheckIn', to: '/outbound/fe-checkin', label: 'Check-in' },
  { key: 'sealedBags', to: '/outbound/assign-fe', label: 'Assign FE' },
  { key: 'assignedBags', to: '/outbound/release-fe', label: 'Release' },
  { key: 'inField', to: '/outbound/in-field', label: 'In-field' },
]

function StageRow(props: { title: string; stages: Stage[]; pathname: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{props.title}</p>
      <div className="flex flex-wrap items-center gap-1">
        {props.stages.map((s, i) => {
          const active = props.pathname.startsWith(s.to)
          return (
            <div key={s.to} className="flex items-center gap-1">
              {i > 0 ? <span className="px-0.5 text-slate-300">→</span> : null}
              <NavLink
                to={s.to}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition',
                  active
                    ? 'border-primary-400 bg-primary-50 text-primary-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200'
                )}
              >
                {s.label}
                {typeof s.count === 'number' && s.count > 0 ? (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                      active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    {s.count}
                  </span>
                ) : null}
              </NavLink>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OutboundFlowStrip(props: { summary?: OutboundFlowSummary | null }) {
  const { pathname } = useLocation()
  const s = props.summary

  const warehouse: Stage[] = WAREHOUSE.map((x) => ({
    to: x.to,
    label: x.label,
    count: x.key && s ? s[x.key] : undefined,
  }))
  const fe: Stage[] = FE_HANDOFF.map((x) => ({
    to: x.to,
    label: x.label,
    count: x.key && s ? s[x.key] : undefined,
  }))

  return (
    <div className="mb-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
      <StageRow title="Warehouse" stages={warehouse} pathname={pathname} />
      <StageRow title="FE handoff" stages={fe} pathname={pathname} />
    </div>
  )
}
