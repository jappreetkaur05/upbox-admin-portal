import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeftRight, Package, PackageX, Truck } from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useInventorySummary, useInventorySkus, useIncomingOrders } from '@/hooks/useInventory'
import { useDamagedInventory, useBatches } from '@/hooks/useInventoryAdmin'
import { useMoves } from '@/hooks/useInbound'
import { inventoryAdminService } from '@/services/inventoryAdmin.service'
import { formatMoney } from '@/lib/cn'

export function InventoryDashboardPage() {
  const summaryQ = useInventorySummary('all')
  const skusQ = useInventorySkus({ brandId: 'all', search: '', health: 'all' })
  const incomingQ = useIncomingOrders('all')
  const damagedQ = useDamagedInventory()
  const batchesQ = useBatches()
  const movesQ = useMoves({ search: '' })
  const snap = inventoryAdminService.dashboardSnapshot()

  const s = summaryQ.data
  const stockValue =
    skusQ.data?.reduce((sum, r) => sum + r.onHand * r.unitValue, 0) ?? 0
  const outOfStock = skusQ.data?.filter((r) => r.available === 0 && r.incoming === 0).length ?? 0
  const expiring = (batchesQ.data ?? []).filter((b) => {
    const days = (new Date(b.expiresAt).getTime() - Date.now()) / 86400_000
    return days <= 30 && days >= 0
  }).length
  const incomingShipments = incomingQ.data?.length ?? 0
  const damagedQty =
    damagedQ.data?.reduce((n, d) => n + d.qty, 0) ?? snap.damagedQty
  const recentMoves = (movesQ.data ?? []).slice(0, 6)

  return (
    <div>
      <PageHeader
        title="Inventory Dashboard"
        description="Quick overview of stock health across the warehouse."
        actions={
          <Link
            to="/outbound/orders"
            className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Today&apos;s orders
          </Link>
        }
      />

      {summaryQ.isLoading || skusQ.isLoading ? <LoadingPanel label="Loading dashboard…" /> : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Products" value={String(snap.productCount)} />
        <Kpi label="Total SKUs" value={String(s?.skuCount ?? snap.skuCount)} />
        <Kpi label="Stock Quantity" value={String(s?.unitsOnHand ?? 0)} />
        <Kpi label="Stock Value" value={formatMoney(stockValue)} />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Attention
          to="/inventory?health=low"
          icon={AlertTriangle}
          title="Low Stock"
          value={s?.lowStockCount ?? 0}
          tone="amber"
        />
        <Attention to="/inventory" icon={Package} title="Out of Stock" value={outOfStock} tone="rose" />
        <Attention
          to="/inventory/incoming"
          icon={Truck}
          title="Incoming Shipments"
          value={incomingShipments}
          tone="sky"
        />
        <Attention
          to="/inventory/damaged"
          icon={PackageX}
          title="Damaged Items"
          value={damagedQty}
          tone="rose"
        />
        <Attention
          to="/inventory/expiry"
          icon={AlertTriangle}
          title="Expiring (≤30 days)"
          value={expiring}
          tone="amber"
        />
        <Attention
          to="/warehouse/moves"
          icon={ArrowLeftRight}
          title="Open movements"
          value={recentMoves.filter((m) => m.state !== 'Complete').length}
          tone="slate"
        />
      </div>

      <section className="surface-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">Recent stock movements</h2>
          <Link to="/warehouse/moves" className="text-xs font-semibold text-sky-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">From → To</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-4 py-2">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMoves.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 font-mono text-xs font-semibold">{m.sku}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {m.fromLabel} → {m.toLabel ?? '—'}
                  </td>
                  <td className="px-4 py-2 font-semibold">{m.quantity}</td>
                  <td className="px-4 py-2 text-xs">{m.state}</td>
                </tr>
              ))}
              {recentMoves.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                    No recent movements
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl text-slate-900">{value}</p>
    </div>
  )
}

function Attention(props: {
  to: string
  title: string
  value: number
  tone: 'amber' | 'rose' | 'sky' | 'slate'
  icon: typeof Package
}) {
  const Icon = props.icon
  const tones = {
    amber: 'border-amber-200 bg-amber-50/80 text-amber-950',
    rose: 'border-rose-200 bg-rose-50/80 text-rose-950',
    sky: 'border-sky-200 bg-sky-50/80 text-sky-950',
    slate: 'border-slate-200 bg-white text-slate-900',
  }
  return (
    <Link
      to={props.to}
      className={`block cursor-pointer rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm ${tones[props.tone]}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-70" />
        <p className="text-sm font-bold">{props.title}</p>
      </div>
      <p className="mt-2 font-heading text-3xl">{props.value}</p>
    </Link>
  )
}
