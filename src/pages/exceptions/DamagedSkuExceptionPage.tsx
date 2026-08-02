import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useCreateDamagedSku,
  useExceptionCases,
  useUpdateDamagedAction,
} from '@/hooks/useExceptionsAdmin'
import {
  DAMAGED_ACTION_LABELS,
  DAMAGED_REASON_LABELS,
  EXCEPTION_STATUS_LABELS,
  type DamagedSkuAction,
  type DamagedSkuReason,
} from '@/types/exceptionsAdmin'

export function DamagedSkuExceptionPage() {
  const casesQ = useExceptionCases('damaged_sku')
  const create = useCreateDamagedSku()
  const updateAction = useUpdateDamagedAction()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    sku: 'AD-UB-WHT-9',
    skuName: 'Adidas Ultraboost White 9',
    qty: 1,
    reason: 'broken' as DamagedSkuReason,
    action: 'scrap' as DamagedSkuAction,
    assignee: '',
  })

  return (
    <div>
      <PageHeader
        title="Damaged SKU"
        description="Exception-center records for damaged products and follow-up actions."
        actions={
          <div className="flex gap-2">
            <Link
              to="/exceptions/resolution"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Resolution
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setDrawer(true)}
            >
              Log damaged SKU
            </button>
          </div>
        }
      />

      {casesQ.isLoading ? <LoadingPanel label="Loading damaged SKUs…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Exception</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(casesQ.data ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.exceptionId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.damaged?.skuName}</p>
                    <p className="font-mono text-[10px] text-sky-700">{c.damaged?.sku}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.damaged?.qty}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.damaged ? DAMAGED_REASON_LABELS[c.damaged.reason] : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.damaged ? (
                      <select
                        className="surface-input cursor-pointer px-2 py-1.5 text-xs"
                        value={c.damaged.action}
                        onChange={async (e) => {
                          await updateAction.mutateAsync({
                            exceptionId: c.exceptionId,
                            action: e.target.value as DamagedSkuAction,
                          })
                        }}
                      >
                        {(Object.keys(DAMAGED_ACTION_LABELS) as DamagedSkuAction[]).map((k) => (
                          <option key={k} value={k}>
                            {DAMAGED_ACTION_LABELS[k]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.assignee ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold ring-1 ring-slate-200">
                      {EXCEPTION_STATUS_LABELS[c.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">Log damaged SKU</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                SKU
                <input
                  className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Product name
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.skuName}
                  onChange={(e) => setForm({ ...form, skuName: e.target.value })}
                />
              </label>
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
                Reason
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value as DamagedSkuReason })}
                >
                  {(Object.keys(DAMAGED_REASON_LABELS) as DamagedSkuReason[]).map((k) => (
                    <option key={k} value={k}>
                      {DAMAGED_REASON_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Action
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.action}
                  onChange={(e) => setForm({ ...form, action: e.target.value as DamagedSkuAction })}
                >
                  {(Object.keys(DAMAGED_ACTION_LABELS) as DamagedSkuAction[]).map((k) => (
                    <option key={k} value={k}>
                      {DAMAGED_ACTION_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Assign user (optional)
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                />
              </label>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <button
                type="button"
                className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold"
                onClick={() => setDrawer(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  await create.mutateAsync({
                    ...form,
                    assignee: form.assignee.trim() || undefined,
                  })
                  setDrawer(false)
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
