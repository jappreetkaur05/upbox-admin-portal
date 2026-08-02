import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateCreditNote, useCreditNotes, useInvoices } from '@/hooks/useFinanceAdmin'
import { CREDIT_REASON_LABELS, type CreditNoteReason } from '@/types/financeAdmin'
import { formatMoney } from '@/lib/cn'

export function CreditNotesPage() {
  const cnQ = useCreditNotes()
  const invQ = useInvoices()
  const create = useCreateCreditNote()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    invoiceNumber: '',
    customer: '',
    reason: 'returned_goods' as CreditNoteReason,
    amount: 1000,
  })

  return (
    <div>
      <PageHeader
        title="Credit Notes"
        description="Credits for returns, overcharges, discounts, and billing corrections."
        actions={
          <div className="flex gap-2">
            <Link
              to="/finance/invoices"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Invoices
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                const inv = invQ.data?.[0]
                setForm({
                  invoiceNumber: inv?.invoiceNumber ?? '',
                  customer: inv?.customer ?? '',
                  reason: 'returned_goods',
                  amount: 1000,
                })
                setDrawer(true)
              }}
            >
              Issue credit note
            </button>
          </div>
        }
      />

      {cnQ.isLoading ? <LoadingPanel label="Loading credit notes…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Credit note #</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(cnQ.data ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.creditNoteNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{c.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium">{c.customer}</td>
                  <td className="px-4 py-3 text-xs">{CREDIT_REASON_LABELS[c.reason]}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(c.amount)}</td>
                  <td className="px-4 py-3 text-xs capitalize">{c.status}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
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
              <h3 className="font-heading text-lg font-semibold">Issue credit note</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Linked invoice
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.invoiceNumber}
                  onChange={(e) => {
                    const inv = invQ.data?.find((i) => i.invoiceNumber === e.target.value)
                    setForm({
                      ...form,
                      invoiceNumber: e.target.value,
                      customer: inv?.customer ?? form.customer,
                    })
                  }}
                >
                  <option value="">Select…</option>
                  {(invQ.data ?? []).map((i) => (
                    <option key={i.id} value={i.invoiceNumber}>
                      {i.invoiceNumber} — {i.customer}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Customer
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Reason
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value as CreditNoteReason })
                  }
                >
                  {(Object.keys(CREDIT_REASON_LABELS) as CreditNoteReason[]).map((k) => (
                    <option key={k} value={k}>
                      {CREDIT_REASON_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Amount
                <input
                  type="number"
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
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
                disabled={!form.invoiceNumber}
                onClick={async () => {
                  await create.mutateAsync(form)
                  setDrawer(false)
                }}
              >
                Issue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
