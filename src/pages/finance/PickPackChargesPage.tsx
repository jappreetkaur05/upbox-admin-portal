import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreatePickPack, usePickPackCharges } from '@/hooks/useFinanceAdmin'
import {
  PICK_PACK_EXTRA_LABELS,
  PICK_PACK_OPTION_LABELS,
  type PickPackBillingOption,
  type PickPackExtra,
} from '@/types/financeAdmin'
import { formatMoney } from '@/lib/cn'

export function PickPackChargesPage() {
  const listQ = usePickPackCharges()
  const create = useCreatePickPack()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    customer: 'Nike India',
    period: 'Aug 2026',
    billingOption: 'per_item' as PickPackBillingOption,
    qty: 1000,
    rate: 4,
    extras: [] as PickPackExtra[],
  })

  const toggleExtra = (e: PickPackExtra) => {
    setForm((f) => ({
      ...f,
      extras: f.extras.includes(e) ? f.extras.filter((x) => x !== e) : [...f.extras, e],
    }))
  }

  return (
    <div>
      <PageHeader
        title="Picking & Packing Charges"
        description="Per order, SKU, item, or package — plus gift wrap, fragile, and custom packaging."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setDrawer(true)}
          >
            Add charge
          </button>
        }
      />

      {listQ.isLoading ? <LoadingPanel label="Loading…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3">Extras</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(listQ.data ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.customer}</td>
                  <td className="px-4 py-3 text-xs">{r.period}</td>
                  <td className="px-4 py-3 text-xs">{PICK_PACK_OPTION_LABELS[r.billingOption]}</td>
                  <td className="px-4 py-3 text-right">{r.qty}</td>
                  <td className="px-4 py-3 text-right">{r.rate}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {r.extras.length
                      ? r.extras.map((e) => PICK_PACK_EXTRA_LABELS[e]).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(r.total)}</td>
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
              <h3 className="font-heading text-lg font-semibold">Pick / pack charge</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Customer
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Period
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.period}
                  onChange={(e) => setForm({ ...form, period: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Billing option
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.billingOption}
                  onChange={(e) =>
                    setForm({ ...form, billingOption: e.target.value as PickPackBillingOption })
                  }
                >
                  {(Object.keys(PICK_PACK_OPTION_LABELS) as PickPackBillingOption[]).map((k) => (
                    <option key={k} value={k}>
                      {PICK_PACK_OPTION_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Qty
                  <input
                    type="number"
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  Rate
                  <input
                    type="number"
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: Number(e.target.value) || 0 })}
                  />
                </label>
              </div>
              <p className="text-xs font-semibold text-slate-600">Extras</p>
              {(Object.keys(PICK_PACK_EXTRA_LABELS) as PickPackExtra[]).map((k) => (
                <label key={k} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.extras.includes(k)}
                    onChange={() => toggleExtra(k)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {PICK_PACK_EXTRA_LABELS[k]}
                </label>
              ))}
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
                  await create.mutateAsync(form)
                  setDrawer(false)
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
