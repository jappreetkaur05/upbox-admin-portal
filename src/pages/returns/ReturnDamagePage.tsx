import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useReturnDamages,
  useUpdateDamageAction,
  useUpsertReturnDamage,
} from '@/hooks/useReturnsAdmin'
import {
  RETURN_DAMAGE_ACTION_LABELS,
  type ReturnDamageAction,
} from '@/types/returnsAdmin'
import { cn } from '@/lib/cn'

export function ReturnDamagePage() {
  const dmgQ = useReturnDamages()
  const upsert = useUpsertReturnDamage()
  const updateAction = useUpdateDamageAction()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    returnId: '',
    sku: '',
    skuName: '',
    qty: 1,
    action: 'scrap' as ReturnDamageAction,
    notes: '',
  })

  return (
    <div>
      <PageHeader
        title="Damage Management"
        description="Handle damaged returned items — repair, supplier return, scrap, dispose, or insurance."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              setForm({
                returnId: 'RET-',
                sku: '',
                skuName: '',
                qty: 1,
                action: 'scrap',
                notes: '',
              })
              setOpen(true)
            }}
          >
            Log damage
          </button>
        }
      />

      {dmgQ.isLoading ? <LoadingPanel label="Loading damage records…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(dmgQ.data ?? []).map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{row.returnId}</td>
                  <td className="px-4 py-3 font-medium">{row.skuName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{row.sku}</td>
                  <td className="px-4 py-3 font-semibold">{row.qty}</td>
                  <td className="px-4 py-3">
                    <select
                      className="surface-input cursor-pointer px-2 py-1.5 text-xs"
                      value={row.action}
                      onChange={async (e) => {
                        await updateAction.mutateAsync({
                          id: row.id,
                          action: e.target.value as ReturnDamageAction,
                        })
                      }}
                    >
                      {(Object.keys(RETURN_DAMAGE_ACTION_LABELS) as ReturnDamageAction[]).map(
                        (k) => (
                          <option key={k} value={k}>
                            {RETURN_DAMAGE_ACTION_LABELS[k]}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-600">
                    {row.notes || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(row.updatedAt).toLocaleDateString()}
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
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">Log return damage</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {(
                [
                  ['returnId', 'Return ID'],
                  ['sku', 'SKU'],
                  ['skuName', 'Product name'],
                  ['notes', 'Notes'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs font-semibold text-slate-600">
                  {label}
                  <input
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-xs font-semibold text-slate-600">
                Qty
                <input
                  type="number"
                  min={1}
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Action
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.action}
                  onChange={(e) =>
                    setForm({ ...form, action: e.target.value as ReturnDamageAction })
                  }
                >
                  {(Object.keys(RETURN_DAMAGE_ACTION_LABELS) as ReturnDamageAction[]).map((k) => (
                    <option key={k} value={k}>
                      {RETURN_DAMAGE_ACTION_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <button
                type="button"
                className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={cn(
                  'cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white'
                )}
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
