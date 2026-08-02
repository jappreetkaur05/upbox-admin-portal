import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Package,
  PackageSearch,
  Percent,
  RefreshCw,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { cn } from '@/lib/cn'

const ALERTS = [
  { id: '1', label: 'SLA risk — 2 orders', to: '/outbound/orders', tone: 'amber' as const },
  { id: '2', label: 'Inventory mismatch', to: '/exceptions/inventory-mismatch', tone: 'rose' as const },
  { id: '3', label: 'Failed dispatch ×2', to: '/exceptions/failed-dispatch', tone: 'rose' as const },
  { id: '4', label: 'Low stock — 112 SKUs', to: '/inventory', tone: 'amber' as const },
  { id: '5', label: 'Returns awaiting QC', to: '/returns/qc', tone: 'slate' as const },
]

const ORDER_SEGMENTS = [
  { label: 'Allocated', value: 186, color: 'bg-sky-500' },
  { label: 'Picking', value: 42, color: 'bg-teal-500' },
  { label: 'Packing', value: 20, color: 'bg-emerald-500' },
]

const ZONES = [
  { label: 'Zone A', pct: 88, color: 'bg-amber-500' },
  { label: 'Zone B', pct: 61, color: 'bg-sky-500' },
  { label: 'Staging', pct: 44, color: 'bg-teal-500' },
]

const REVENUE_SHARES = [
  { label: 'Storage', pct: 52, color: 'bg-sky-500' },
  { label: 'Pick / pack', pct: 31, color: 'bg-teal-500' },
  { label: 'Other', pct: 17, color: 'bg-slate-400' },
]

const TASKS = [
  { label: 'Exceptions', count: 7 },
  { label: 'Cycle counts', count: 5 },
  { label: 'Approvals', count: 7 },
]

function TileShell(props: {
  className?: string
  delayMs?: number
  to?: string
  children: ReactNode
}) {
  const style = { animationDelay: `${props.delayMs ?? 0}ms` }
  const classes = cn(
    'dash-tile-enter group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition duration-200',
    props.to && 'cursor-pointer hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md',
    props.className
  )

  if (props.to) {
    return (
      <Link to={props.to} className={classes} style={style}>
        {props.children}
        <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-300 opacity-0 transition group-hover:opacity-100 group-hover:text-sky-500" />
      </Link>
    )
  }

  return (
    <div className={classes} style={style}>
      {props.children}
    </div>
  )
}

function MiniBar(props: { pct: number; color: string; delayMs?: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={cn('dash-bar-fill h-full rounded-full', props.color)}
        style={{ width: `${props.pct}%`, animationDelay: `${props.delayMs ?? 0}ms` }}
      />
    </div>
  )
}

function StackedBar(props: { segments: { value: number; color: string; label: string }[]; delayMs?: number }) {
  const total = props.segments.reduce((s, x) => s + x.value, 0) || 1
  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {props.segments.map((seg, i) => (
          <div
            key={seg.label}
            className={cn('dash-bar-fill h-full', seg.color)}
            style={{
              width: `${(seg.value / total) * 100}%`,
              animationDelay: `${(props.delayMs ?? 0) + i * 60}ms`,
            }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {props.segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1.5">
            <span className={cn('h-2 w-2 rounded-sm', seg.color)} />
            {seg.label} {seg.value}
          </span>
        ))}
      </div>
    </div>
  )
}

function SlaRing(props: { value: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  const offset = c * (1 - props.value / 100)
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="dash-tile-enter"
          style={{ animationDelay: '120ms' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-xl text-slate-900">{props.value}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">SLA</span>
      </div>
    </div>
  )
}

export function GlobalDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Today’s warehouse at a glance."
        actions={
          <div className="flex gap-2">
            <Link
              to="/outbound/orders"
              className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Orders
            </Link>
            <Link
              to="/inbound/dashboard"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            >
              Inbound overview
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-fr">
        {/* Overview — hero */}
        <TileShell
          className="border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-slate-50 sm:col-span-2 lg:col-span-8 lg:row-span-2 lg:min-h-[220px]"
          delayMs={0}
        >
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">Overview</p>
                  <h2 className="font-heading text-xl text-slate-900 sm:text-2xl">Warehouse healthy</h2>
                </div>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-600">
                12 open waves · 3 docks active · operations within SLA.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Systems nominal
                </span>
                <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                  3 docks live
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  12 waves open
                </span>
              </div>
            </div>
            <SlaRing value={94} />
          </div>
        </TileShell>

        {/* Alerts */}
        <TileShell
          className="border-amber-200/90 bg-gradient-to-b from-amber-50/90 to-white sm:col-span-2 lg:col-span-4 lg:row-span-2"
          delayMs={40}
        >
          <div className="mb-3 flex items-center justify-between gap-2 pr-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">Alerts & Notifications</h2>
                <p className="text-xs text-slate-500">Needs attention</p>
              </div>
            </div>
            <span className="dash-alert-pulse inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-amber-500 px-2 text-xs font-bold text-white">
              5
            </span>
          </div>
          <ul className="flex flex-1 flex-col gap-1.5">
            {ALERTS.map((a) => (
              <li key={a.id}>
                <Link
                  to={a.to}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-sm transition hover:border-amber-200 hover:bg-amber-50/80',
                    a.tone === 'rose' && 'text-rose-800',
                    a.tone === 'amber' && 'text-amber-900',
                    a.tone === 'slate' && 'text-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      a.tone === 'rose' && 'bg-rose-500',
                      a.tone === 'amber' && 'bg-amber-500',
                      a.tone === 'slate' && 'bg-slate-400'
                    )}
                  />
                  <span className="flex-1 truncate font-medium">{a.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </TileShell>

        {/* Today's Orders */}
        <TileShell
          className="border-l-4 border-l-sky-500 sm:col-span-1 lg:col-span-4 lg:row-span-2"
          delayMs={80}
          to="/outbound/orders"
        >
          <div className="mb-2 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Today&apos;s Orders</h2>
          </div>
          <p className="font-heading text-3xl tracking-tight text-slate-900">248</p>
          <p className="mt-1 text-xs text-slate-500">orders in motion today</p>
          <div className="mt-auto pt-5">
            <StackedBar segments={ORDER_SEGMENTS} delayMs={200} />
          </div>
        </TileShell>

        {/* Inbound */}
        <TileShell
          className="border-l-4 border-l-teal-500 bg-teal-50/30 lg:col-span-4"
          delayMs={120}
          to="/inbound/dashboard"
        >
          <div className="mb-2 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <Truck className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Inbound Status</h2>
          </div>
          <p className="font-heading text-2xl text-slate-900">6 ASNs</p>
          <p className="text-xs text-slate-500">in progress</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/80 px-2.5 py-2 ring-1 ring-teal-100">
              <p className="text-[10px] font-semibold uppercase text-teal-700">Dock</p>
              <p className="text-sm font-bold text-slate-900">24 cartons</p>
            </div>
            <div className="rounded-lg bg-white/80 px-2.5 py-2 ring-1 ring-teal-100">
              <p className="text-[10px] font-semibold uppercase text-teal-700">Putaway</p>
              <p className="text-sm font-bold text-slate-900">11 queues</p>
            </div>
          </div>
        </TileShell>

        {/* Outbound */}
        <TileShell
          className="border-l-4 border-l-sky-400 bg-sky-50/30 lg:col-span-4"
          delayMs={160}
          to="/outbound/dashboard"
        >
          <div className="mb-2 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Package className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Outbound Status</h2>
          </div>
          <p className="font-heading text-lg text-slate-900">Pipeline on track</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              { label: '58 pick', cls: 'bg-sky-100 text-sky-800' },
              { label: '31 pack', cls: 'bg-teal-100 text-teal-800' },
              { label: '14 FE ready', cls: 'bg-emerald-100 text-emerald-800' },
            ].map((c) => (
              <span key={c.label} className={cn('rounded-md px-2 py-1 text-[11px] font-semibold', c.cls)}>
                {c.label}
              </span>
            ))}
          </div>
        </TileShell>

        {/* Inventory */}
        <TileShell
          className="border-l-4 border-l-emerald-500 bg-emerald-50/30 lg:col-span-4"
          delayMs={200}
          to="/inventory"
        >
          <div className="mb-2 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <PackageSearch className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Inventory Summary</h2>
          </div>
          <p className="font-heading text-2xl text-slate-900">18.4k</p>
          <p className="text-xs text-slate-500">SKUs on hand</p>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-medium text-amber-900">
            112 low stock · 8 quarantine holds
          </div>
        </TileShell>

        {/* Utilization */}
        <TileShell
          className="border-l-4 border-l-amber-500 lg:col-span-6"
          delayMs={240}
          to="/inventory/utilization"
        >
          <div className="mb-3 flex items-center justify-between gap-2 pr-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Percent className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">Warehouse Utilization</h2>
            </div>
            <p className="font-heading text-2xl text-slate-900">72%</p>
          </div>
          <div className="space-y-3">
            {ZONES.map((z, i) => (
              <div key={z.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{z.label}</span>
                  <span className="font-semibold text-slate-800">{z.pct}%</span>
                </div>
                <MiniBar pct={z.pct} color={z.color} delayMs={280 + i * 80} />
              </div>
            ))}
          </div>
        </TileShell>

        {/* Pending tasks */}
        <TileShell
          className="border-l-4 border-l-slate-400 lg:col-span-3"
          delayMs={280}
          to="/inbound/my-work"
        >
          <div className="mb-2 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <ClipboardList className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Pending Tasks</h2>
          </div>
          <p className="font-heading text-2xl text-slate-900">19</p>
          <ul className="mt-3 space-y-1.5">
            {TASKS.map((t) => (
              <li key={t.label} className="flex items-center justify-between text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  {t.label}
                </span>
                <span className="font-bold text-slate-800">{t.count}</span>
              </li>
            ))}
          </ul>
        </TileShell>

        {/* Returns */}
        <TileShell
          className="border-l-4 border-l-teal-400 lg:col-span-3"
          delayMs={320}
          to="/returns/orders"
        >
          <div className="mb-2 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <RefreshCw className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Returns Summary</h2>
          </div>
          <p className="font-heading text-2xl text-slate-900">14</p>
          <p className="text-xs text-slate-500">returns today</p>
          <div className="mt-3 grid grid-cols-3 gap-1 text-center">
            {[
              { n: 6, l: 'QC' },
              { n: 4, l: 'Restock' },
              { n: 4, l: 'RTO' },
            ].map((x) => (
              <div key={x.l} className="rounded-lg bg-slate-50 px-1 py-1.5">
                <p className="text-sm font-bold text-slate-900">{x.n}</p>
                <p className="text-[10px] text-slate-500">{x.l}</p>
              </div>
            ))}
          </div>
        </TileShell>

        {/* Revenue */}
        <TileShell
          className="border-l-4 border-l-emerald-600 bg-gradient-to-br from-emerald-50/50 to-white lg:col-span-6"
          delayMs={360}
          to="/finance/reports"
        >
          <div className="mb-3 flex items-center gap-2 pr-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Banknote className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Revenue Overview</h2>
              <p className="text-xs text-slate-500">Billed MTD</p>
            </div>
          </div>
          <p className="font-heading text-3xl tracking-tight text-slate-900">₹4.2L</p>
          <div className="mt-4 space-y-2.5">
            {REVENUE_SHARES.map((r, i) => (
              <div key={r.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{r.label}</span>
                  <span className="font-semibold text-slate-800">{r.pct}%</span>
                </div>
                <MiniBar pct={r.pct} color={r.color} delayMs={400 + i * 70} />
              </div>
            ))}
          </div>
        </TileShell>
      </div>
    </div>
  )
}
