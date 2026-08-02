import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useAdjustments, useCreateAdjustment, useSkuMasters } from '@/hooks/useInventoryAdmin'
import { ADJUSTMENT_REASON_LABELS, type AdjustmentReason } from '@/types/inventoryAdmin'

export function InventoryAdjustmentPage() {
  const adjQ = useAdjustments()
  const skusQ = useSkuMasters()
  const create = useCreateAdjustment()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    sku: '',
    beforeQty: 100,
    afterQty: 97,
    reason: 'miscount' as AdjustmentReason,
    notes: '',
  })

  const skuName = useMemo(
    () => skusQ.data?.find((s) => s.sku === form.sku)?.productName ?? form.sku,
    [skusQ.data, form.sku]
  )

  return (
    <div>
      <PageHeader
        title="Inventory Adjustment"
        description="Correct system quantity when it does not match the physical count."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              setForm({
                sku: skusQ.data?.[0]?.sku ?? '',
                beforeQty: 100,
                afterQty: 97,
                reason: 'miscount',
                notes: '',
              })
              setOpen(true)
            }}
          >
            New adjustment
          </button>
        }
      />

      {adjQ.isLoading ? <LoadingPanel label="Loading adjustments…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Before</th>
                <th className="px-4 py-3">After</th>
                <th className="px-4 py-3">Delta</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(adjQ.data ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {new Date(a.at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold">{a.sku}</div>
                    <div className="text-xs text-slate-500">{a.skuName}</div>
                  </td>
                  <td className="px-4 py-3">{a.beforeQty}</td>
                  <td className="px-4 py-3">{a.afterQty}</td>
                  <td className={`px-4 py-3 font-semibold ${a.delta < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {a.delta > 0 ? `+${a.delta}` : a.delta}
                  </td>
                  <td className="px-4 py-3 text-xs">{ADJUSTMENT_REASON_LABELS[a.reason]}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{a.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-5 py-4 font-heading text-lg">New adjustment</div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {error ? <p className="text-sm text-rose-700">{error}</p> : null}
              <label className="block text-xs font-semibold">
                SKU
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                >
                  {(skusQ.data ?? []).map((s) => (
                    <option key={s.id} value={s.sku}>
                      {s.sku} — {s.productName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold">
                System qty
                <input
                  type="number"
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.beforeQty}
                  onChange={(e) => setForm((f) => ({ ...f, beforeQty: Number(e.target.value) }))}
                />
              </label>
              <label className="block text-xs font-semibold">
                Actual count
                <input
                  type="number"
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.afterQty}
                  onChange={(e) => setForm((f) => ({ ...f, afterQty: Number(e.target.value) }))}
                />
              </label>
              <p className="text-xs text-slate-500">
                Adjustment: {form.afterQty - form.beforeQty > 0 ? '+' : ''}
                {form.afterQty - form.beforeQty}
              </p>
              <label className="block text-xs font-semibold">
                Reason
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value as AdjustmentReason }))}
                >
                  {Object.entries(ADJUSTMENT_REASON_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold">
                Notes
                <textarea
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </label>
            </div>
            <div className="flex gap-2 border-t p-4">
              <button type="button" className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                disabled={create.isPending}
                onClick={async () => {
                  setError(null)
                  try {
                    await create.mutateAsync({
                      sku: form.sku,
                      skuName,
                      beforeQty: form.beforeQty,
                      afterQty: form.afterQty,
                      reason: form.reason,
                      notes: form.notes,
                    })
                    setOpen(false)
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Failed')
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-slate-500">
        Variances from <Link className="font-semibold text-sky-700 underline" to="/inventory/audit">Inventory Audit</Link> can be posted here.
      </p>
    </div>
  )
}
