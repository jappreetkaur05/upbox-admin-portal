import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateStorageCalc, useStorageCalcs } from '@/hooks/useFinanceAdmin'
import { STORAGE_METHOD_LABELS, type StorageMethod } from '@/types/financeAdmin'
import { formatMoney } from '@/lib/cn'

export function StorageChargesPage() {
  const calcsQ = useStorageCalcs()
  const create = useCreateStorageCalc()
  const [form, setForm] = useState({
    customer: 'Nike India',
    method: 'pallet' as StorageMethod,
    qty: 100,
    rate: 20,
    days: 30,
  })

  const preview = useMemo(
    () => form.qty * form.rate * form.days,
    [form.qty, form.rate, form.days]
  )

  return (
    <div>
      <PageHeader
        title="Storage Charges"
        description="Bill by pallet, bin, rack, CBM, or period — qty × rate × days."
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="surface-panel h-fit space-y-3 p-4">
          <h3 className="font-heading text-sm font-semibold">Calculator</h3>
          <label className="block text-xs font-semibold text-slate-600">
            Customer
            <input
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Method
            <select
              className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value as StorageMethod })}
            >
              {(Object.keys(STORAGE_METHOD_LABELS) as StorageMethod[]).map((k) => (
                <option key={k} value={k}>
                  {STORAGE_METHOD_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          {(
            [
              ['qty', 'Quantity'],
              ['rate', 'Rate (₹)'],
              ['days', 'Days'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-slate-600">
              {label}
              <input
                type="number"
                className="surface-input mt-1 w-full px-3 py-2 text-sm"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) || 0 })}
              />
            </label>
          ))}
          <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900">
            Total = {formatMoney(preview)}
          </p>
          <p className="text-[11px] text-slate-500">
            e.g. 100 pallets × ₹20 × 30 days = ₹60,000
          </p>
          <button
            type="button"
            className="w-full cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => create.mutate(form)}
          >
            Save calculation
          </button>
        </aside>

        <section>
          {calcsQ.isLoading ? <LoadingPanel label="Loading…" /> : null}
          <div className="surface-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Days</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(calcsQ.data ?? []).map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium">{c.customer}</td>
                      <td className="px-4 py-3 text-xs">{STORAGE_METHOD_LABELS[c.method]}</td>
                      <td className="px-4 py-3 text-right">{c.qty}</td>
                      <td className="px-4 py-3 text-right">{c.rate}</td>
                      <td className="px-4 py-3 text-right">{c.days}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMoney(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
