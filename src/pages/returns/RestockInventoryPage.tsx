import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCompleteRestock, useRestockJobs } from '@/hooks/useReturnsAdmin'
import { cn } from '@/lib/cn'

export function RestockInventoryPage() {
  const jobsQ = useRestockJobs()
  const complete = useCompleteRestock()
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [locationCode, setLocationCode] = useState('W.A.R1.B2.1')

  const job = (jobsQ.data ?? []).find((j) => j.id === drawerId) ?? null

  return (
    <div>
      <PageHeader
        title="Restock Inventory"
        description="Approve sellable returns, assign a storage location, and update stock."
        actions={
          <Link
            to="/returns/qc"
            className="cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to QC
          </Link>
        }
      />

      {jobsQ.isLoading ? <LoadingPanel label="Loading restock jobs…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(jobsQ.data ?? []).map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{row.returnId}</td>
                  <td className="px-4 py-3 font-medium">{row.skuName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{row.sku}</td>
                  <td className="px-4 py-3 font-semibold">{row.qty}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.locationCode ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-bold capitalize ring-1',
                        row.status === 'restocked'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-amber-50 text-amber-900 ring-amber-200'
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.status !== 'restocked' ? (
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white"
                        onClick={() => {
                          setDrawerId(row.id)
                          setLocationCode(row.locationCode ?? 'W.A.R1.B2.1')
                        }}
                      >
                        Assign & restock
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Done</span>
                    )}
                  </td>
                </tr>
              ))}
              {(jobsQ.data ?? []).length === 0 && !jobsQ.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No restock jobs. Mark QC disposition as Sellable first.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {drawerId && job ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">Restock {job.returnId}</h3>
              <p className="text-xs text-slate-500">
                {job.skuName} · {job.sku} · qty {job.qty}
              </p>
            </div>
            <div className="flex-1 space-y-3 p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Storage location
                <input
                  className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm"
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  placeholder="W.A.R1.B2.1"
                />
              </label>
              <p className="text-xs text-slate-500">
                Approves the return and marks inventory restocked at this bin.
              </p>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <button
                type="button"
                className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold"
                onClick={() => setDrawerId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  if (!locationCode.trim()) return
                  await complete.mutateAsync({ id: job.id, locationCode: locationCode.trim() })
                  setDrawerId(null)
                }}
              >
                Complete restock
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
