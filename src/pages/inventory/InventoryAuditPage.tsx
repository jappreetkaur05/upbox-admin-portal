import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useAudits, useUpdateAuditLine } from '@/hooks/useInventoryAdmin'
import { cn } from '@/lib/cn'

export function InventoryAuditPage() {
  const auditsQ = useAudits()
  const updateLine = useUpdateAuditLine()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const audits = auditsQ.data ?? []
  const selected = audits.find((a) => a.id === selectedId) ?? audits[0]

  return (
    <div>
      <PageHeader
        title="Inventory Audit"
        description="Verify physical stock against system records. Post variances via Adjustment."
      />
      {auditsQ.isLoading ? <LoadingPanel label="Loading audits…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {audits.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedId(a.id)}
              className={cn(
                'w-full cursor-pointer rounded-xl border p-3 text-left text-sm',
                selected?.id === a.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white'
              )}
            >
              <p className="font-semibold text-slate-900">{a.name}</p>
              <p className="text-xs text-slate-500">{a.scope}</p>
              <p className="mt-1 text-[11px] font-bold capitalize text-slate-600">{a.status.replace('_', ' ')}</p>
            </button>
          ))}
        </div>

        {selected ? (
          <section className="surface-panel overflow-hidden">
            <div className="border-b px-4 py-3">
              <h2 className="font-heading text-base">{selected.name}</h2>
              <p className="text-xs text-slate-500">{selected.scope}</p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">System</th>
                  <th className="px-4 py-2">Actual</th>
                  <th className="px-4 py-2">Variance</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selected.lines.map((l) => {
                  const variance = l.actualQty == null ? null : l.actualQty - l.systemQty
                  return (
                    <tr key={l.sku}>
                      <td className="px-4 py-2">
                        <div className="font-mono text-xs font-bold">{l.sku}</div>
                        <div className="text-xs text-slate-500">{l.skuName}</div>
                      </td>
                      <td className="px-4 py-2">{l.systemQty}</td>
                      <td className="px-4 py-2">
                        {selected.status === 'closed' ? (
                          l.actualQty ?? '—'
                        ) : (
                          <input
                            type="number"
                            className="surface-input w-20 px-2 py-1 text-sm"
                            defaultValue={l.actualQty ?? ''}
                            onBlur={(e) => {
                              const v = Number(e.target.value)
                              if (!Number.isNaN(v)) {
                                void updateLine.mutateAsync({
                                  auditId: selected.id,
                                  sku: l.sku,
                                  actualQty: v,
                                })
                              }
                            }}
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {variance == null ? '—' : variance > 0 ? `+${variance}` : variance}
                      </td>
                      <td className="px-4 py-2">
                        {variance != null && variance !== 0 ? (
                          <Link
                            to="/inventory/adjustment"
                            className="text-xs font-semibold text-sky-700 hover:underline"
                          >
                            Adjust
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </div>
  )
}
