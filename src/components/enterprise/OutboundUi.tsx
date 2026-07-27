import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export function KpiCard(props: {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: 'default' | 'success' | 'warn' | 'danger' | 'info'
  onClick?: () => void
}) {
  const Icon = props.icon
  const tones = {
    default: 'border-slate-200 bg-white',
    success: 'border-emerald-200 bg-emerald-50/60',
    warn: 'border-amber-200 bg-amber-50/60',
    danger: 'border-red-200 bg-red-50/60',
    info: 'border-sky-200 bg-sky-50/60',
  }
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        'rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        tones[props.tone ?? 'default'],
        !props.onClick && 'cursor-default'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{props.label}</p>
          <p className="mt-1 font-heading text-2xl text-slate-900">{props.value}</p>
          {props.hint ? <p className="mt-1 text-xs text-slate-500">{props.hint}</p> : null}
        </div>
        {Icon ? (
          <span className="rounded-xl bg-white/80 p-2 text-primary-600 shadow-sm">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </button>
  )
}

export function StatusBadge(props: { label: string; tone?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-sky-100 text-sky-800',
    green: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-800',
    violet: 'bg-violet-100 text-violet-800',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold', map[props.tone ?? 'slate'])}>
      {props.label}
    </span>
  )
}

export function SideDrawer(props: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  widthClass?: string
}) {
  if (!props.open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" onClick={props.onClose} />
      <aside
        className={cn(
          'relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right',
          props.widthClass
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-heading text-lg text-slate-900">{props.title}</h2>
          <button type="button" onClick={props.onClose} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{props.children}</div>
      </aside>
    </div>
  )
}

export function StatusTimeline(props: {
  events: { id: string; at: string; label: string; detail?: string; actor?: string }[]
}) {
  return (
    <ol className="space-y-4">
      {props.events.map((e, i) => (
        <li key={e.id} className="relative flex gap-3 pl-1">
          <div className="flex flex-col items-center">
            <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', i === 0 ? 'bg-primary-500' : 'bg-slate-300')} />
            {i < props.events.length - 1 ? <span className="mt-1 w-px flex-1 bg-slate-200" /> : null}
          </div>
          <div className="pb-2">
            <p className="text-sm font-semibold text-slate-800">{e.label}</p>
            {e.detail ? <p className="text-xs text-slate-500">{e.detail}</p> : null}
            <p className="mt-0.5 text-[11px] text-slate-400">
              {new Date(e.at).toLocaleString()}
              {e.actor ? ` · ${e.actor}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function Breadcrumbs(props: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
      {props.items.map((item, i) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          {i > 0 ? <span>/</span> : null}
          <span className={i === props.items.length - 1 ? 'font-semibold text-slate-700' : ''}>{item.label}</span>
        </span>
      ))}
    </nav>
  )
}

export function orderStatusTone(status: string): 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'violet' {
  if (['DELIVERED', 'READY', 'PACKED', 'DISPATCHED'].includes(status)) return 'green'
  if (['OPEN', 'ALLOCATED', 'WAVED'].includes(status)) return 'blue'
  if (['PICKING', 'PACKING', 'IN_TRANSIT', 'IN_ROUTE_BAG', 'ASSIGNED_TO_FE', 'RELEASED_TO_FE', 'LOADED'].includes(status))
    return 'violet'
  if (['ON_HOLD', 'FAILED', 'RETURNED'].includes(status)) return 'red'
  if (status === 'URGENT' || status.includes('SLA')) return 'amber'
  return 'slate'
}
