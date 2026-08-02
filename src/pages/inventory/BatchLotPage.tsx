import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useBatches } from '@/hooks/useInventoryAdmin'

export function BatchLotPage() {
  const batchesQ = useBatches()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (batchesQ.data ?? []).filter(
      (b) =>
        !needle ||
        b.batchCode.toLowerCase().includes(needle) ||
        b.sku.toLowerCase().includes(needle)
    )
  }, [batchesQ.data, q])

  return (
    <div>
      <PageHeader
        title="Batch / Lot Management"
        description="Products manufactured together — track manufacture and expiry for recalls."
      />
      <input
        className="surface-input mb-4 w-full max-w-md px-3 py-2 text-sm"
        placeholder="Filter by batch code or SKU (e.g. B240501)…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {batchesQ.isLoading ? <LoadingPanel label="Loading batches…" /> : null}
      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Manufactured</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((b) => {
                const days = (new Date(b.expiresAt).getTime() - Date.now()) / 86400_000
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-mono text-xs font-bold">{b.batchCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{b.sku}</div>
                      <div className="text-xs text-slate-500">{b.skuName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">{b.manufacturedAt}</td>
                    <td className="px-4 py-3 text-xs">
                      {b.expiresAt}
                      {days <= 30 && days >= 0 ? (
                        <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                          {Math.ceil(days)}d
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-semibold">{b.qtyOnHand}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.locationCode}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
