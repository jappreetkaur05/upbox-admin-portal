import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useDamagedInventory, useSkuMasters, useUpsertDamaged } from '@/hooks/useInventoryAdmin'
import { DAMAGED_STATUS_LABELS, type DamagedRecord } from '@/types/inventoryAdmin'
import { cn } from '@/lib/cn'

export function DamagedInventoryPage() {
  const damagedQ = useDamagedInventory()
  const skusQ = useSkuMasters()
  const upsert = useUpsertDamaged()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    sku: '',
    skuName: '',
    qty: 1,
    reason: '',
    status: 'scrap' as DamagedRecord['status'],
  })

  return (
    <div>
      <PageHeader
        title="Damaged Inventory"
        description="Stock that cannot be sold — separate from available inventory."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              const s = skusQ.data?.[0]
              setForm({
                id: undefined,
                sku: s?.sku ?? '',
                skuName: s?.productName ?? '',
                qty: 1,
                reason: '',
                status: 'scrap',
              })
              setOpen(true)
            }}
          >
            Log damaged
          </button>
        }
      />

      {damagedQ.isLoading ? <LoadingPanel label="Loading damaged stock…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(damagedQ.data ?? []).map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {new Date(d.at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-bold">{d.sku}</div>
                    <div className="text-xs text-slate-500">{d.skuName}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{d.qty}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{d.reason}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800">
                      {DAMAGED_STATUS_LABELS[d.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                      onClick={() => {
                        setForm({ ...d, id: d.id })
                        setOpen(true)
                      }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-5 py-4 font-heading text-lg">
              {form.id ? 'Update damaged' : 'Log damaged'}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <label className="block text-xs font-semibold">
                SKU
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.sku}
                  onChange={(e) => {
                    const s = skusQ.data?.find((x) => x.sku === e.target.value)
                    setForm((f) => ({
                      ...f,
                      sku: e.target.value,
                      skuName: s?.productName ?? f.skuName,
                    }))
                  }}
                >
                  {(skusQ.data ?? []).map((s) => (
                    <option key={s.id} value={s.sku}>
                      {s.sku}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold">
                Qty
                <input
                  type="number"
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.qty}
                  onChange={(e) => setForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                />
              </label>
              <label className="block text-xs font-semibold">
                Reason
                <textarea
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold">
                Disposition
                <select
                  className={cn('surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm')}
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as DamagedRecord['status'] }))
                  }
                >
                  {Object.entries(DAMAGED_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2 border-t p-4">
              <button type="button" className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                disabled={upsert.isPending || !form.reason.trim()}
                onClick={async () => {
                  await upsert.mutateAsync(form)
                  setOpen(false)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
