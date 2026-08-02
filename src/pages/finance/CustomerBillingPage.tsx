import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateCustomerBill, useCustomerBills } from '@/hooks/useFinanceAdmin'
import {
  PAYMENT_STATUS_LABELS,
  SERVICE_KIND_LABELS,
  type BillableServiceKind,
  type ServiceLine,
} from '@/types/financeAdmin'
import { cn, formatMoney } from '@/lib/cn'

export function CustomerBillingPage() {
  const billsQ = useCustomerBills()
  const create = useCreateCustomerBill()
  const [drawer, setDrawer] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    customer: 'Nike India',
    period: 'Aug 2026',
    storage: 20000,
    picking: 8000,
    packing: 4000,
  })

  const selected = (billsQ.data ?? []).find((b) => b.id === selectedId) ?? null

  return (
    <div>
      <PageHeader
        title="Customer Billing"
        description="Invoices for storage, pick/pack, shipping, returns, and VAS."
        actions={
          <div className="flex gap-2">
            <Link
              to="/finance/invoices"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Invoices
            </Link>
            <Link
              to="/finance/payments"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Payments
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setDrawer(true)}
            >
              New bill
            </button>
          </div>
        }
      />

      {billsQ.isLoading ? <LoadingPanel label="Loading bills…" /> : null}

      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-[1fr_300px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[880px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3 text-right">Taxes</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(billsQ.data ?? []).map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedId(b.id === selectedId ? null : b.id)}
                    className={cn(
                      'cursor-pointer hover:bg-sky-50/50',
                      selected?.id === b.id && 'bg-sky-50'
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{b.customer}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{b.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{b.period}</td>
                    <td className="px-4 py-3 text-right text-xs">{formatMoney(b.taxes)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(b.total)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold ring-1 ring-slate-200">
                        {PAYMENT_STATUS_LABELS[b.paymentStatus]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel p-4">
            <p className="text-[11px] font-bold uppercase text-slate-500">Services</p>
            <h2 className="mt-1 font-heading text-lg">{selected.customer}</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {selected.services.map((s) => (
                <li key={s.kind} className="flex justify-between gap-2">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-semibold">{formatMoney(s.amount)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t pt-2 font-semibold">
                <span>Tax</span>
                <span>{formatMoney(selected.taxes)}</span>
              </li>
            </ul>
          </aside>
        ) : null}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">New customer bill</h3>
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
              {(
                [
                  ['storage', 'Storage'],
                  ['picking', 'Picking'],
                  ['packing', 'Packing'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs font-semibold text-slate-600">
                  {label} amount
                  <input
                    type="number"
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) || 0 })}
                  />
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
                  const services: ServiceLine[] = (
                    [
                      ['storage', form.storage],
                      ['picking', form.picking],
                      ['packing', form.packing],
                    ] as [BillableServiceKind, number][]
                  )
                    .filter(([, a]) => a > 0)
                    .map(([kind, amount]) => ({
                      kind,
                      label: SERVICE_KIND_LABELS[kind],
                      amount,
                    }))
                  await create.mutateAsync({
                    customer: form.customer,
                    period: form.period,
                    services,
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
