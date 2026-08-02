import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSerials } from '@/hooks/useInventoryAdmin'
import { cn } from '@/lib/cn'

export function SerialNumberPage() {
  const serialsQ = useSerials()
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (serialsQ.data ?? []).filter(
      (s) =>
        !needle ||
        s.serial.toLowerCase().includes(needle) ||
        s.sku.toLowerCase().includes(needle)
    )
  }, [serialsQ.data, q])

  return (
    <div>
      <PageHeader
        title="Serial Number Management"
        description="Track each individual unit (phones, devices) instead of quantity only."
      />
      <input
        className="surface-input mb-4 w-full max-w-md px-3 py-2 text-sm"
        placeholder="Search serial or SKU…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {serialsQ.isLoading ? <LoadingPanel label="Loading serials…" /> : null}
      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">SKU / Product</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold">{s.serial}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs">{s.sku}</div>
                    <div className="text-xs text-slate-500">{s.skuName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-bold capitalize',
                        s.status === 'in_stock' && 'bg-emerald-50 text-emerald-800',
                        s.status === 'reserved' && 'bg-sky-50 text-sky-800',
                        s.status === 'sold' && 'bg-slate-100 text-slate-600',
                        s.status === 'damaged' && 'bg-rose-50 text-rose-800'
                      )}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{s.locationCode ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
