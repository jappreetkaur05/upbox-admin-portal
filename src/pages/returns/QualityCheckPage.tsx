import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useQcResults, useSetQcDisposition } from '@/hooks/useReturnsAdmin'
import { QC_DISPOSITION_LABELS, type QcDisposition } from '@/types/returnsAdmin'
import { cn } from '@/lib/cn'

export function QualityCheckPage() {
  const qcQ = useQcResults()
  const setDisp = useSetQcDisposition()

  return (
    <div>
      <PageHeader
        title="Quality Check"
        description="Decide if a returned product is sellable, repairable, damaged, or scrap."
        actions={
          <div className="flex gap-2">
            <Link
              to="/returns/restock"
              className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Restock
            </Link>
            <Link
              to="/returns/damage"
              className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Damage
            </Link>
          </div>
        }
      />

      {qcQ.isLoading ? <LoadingPanel label="Loading QC…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Disposition</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(qcQ.data ?? []).map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{row.returnId}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.skuName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{row.sku}</td>
                  <td className="px-4 py-3 font-semibold">{row.qty}</td>
                  <td className="px-4 py-3">
                    {row.disposition ? (
                      <span
                        className={cn(
                          'rounded-lg px-2 py-1 text-xs font-bold ring-1',
                          row.disposition === 'sellable'
                            ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                            : 'bg-amber-50 text-amber-900 ring-amber-200'
                        )}
                      >
                        {QC_DISPOSITION_LABELS[row.disposition]}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Unset</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="surface-input cursor-pointer px-2 py-1.5 text-xs"
                      value={row.disposition ?? ''}
                      onChange={async (e) => {
                        const v = e.target.value as QcDisposition
                        if (!v) return
                        await setDisp.mutateAsync({ id: row.id, disposition: v })
                      }}
                    >
                      <option value="">Set disposition…</option>
                      {(Object.keys(QC_DISPOSITION_LABELS) as QcDisposition[]).map((k) => (
                        <option key={k} value={k}>
                          {QC_DISPOSITION_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {(qcQ.data ?? []).length === 0 && !qcQ.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No QC lines. Send returns from Inspection with “Sent for QC”.
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
