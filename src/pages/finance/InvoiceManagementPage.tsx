import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useCustomerBills,
  useGenerateInvoice,
  useInvoices,
  useSetInvoiceStatus,
} from '@/hooks/useFinanceAdmin'
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from '@/types/financeAdmin'
import { cn, formatMoney } from '@/lib/cn'

export function InvoiceManagementPage() {
  const invQ = useInvoices()
  const billsQ = useCustomerBills()
  const generate = useGenerateInvoice()
  const setStatus = useSetInvoiceStatus()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [genOpen, setGenOpen] = useState(false)

  const selected = (invQ.data ?? []).find((i) => i.id === selectedId) ?? null

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <div>
      <PageHeader
        title="Invoice Management"
        description="Create, GST-calculate, cancel/reissue invoices. PDF and email are mock actions."
        actions={
          <div className="flex gap-2">
            <Link
              to="/finance/customer-billing"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Customer billing
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setGenOpen(true)}
            >
              Generate invoice
            </button>
          </div>
        }
      />

      {toast ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      ) : null}

      {invQ.isLoading ? <LoadingPanel label="Loading invoices…" /> : null}

      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-[1fr_320px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">GST</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(invQ.data ?? []).map((i) => (
                  <tr
                    key={i.id}
                    onClick={() => setSelectedId(i.id === selectedId ? null : i.id)}
                    className={cn(
                      'cursor-pointer hover:bg-sky-50/50',
                      selected?.id === i.id && 'bg-sky-50'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{i.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium">{i.customer}</td>
                    <td className="px-4 py-3 text-xs">{i.period}</td>
                    <td className="px-4 py-3 text-right text-xs">{formatMoney(i.subtotal)}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      {i.gstPercent}% · {formatMoney(i.tax)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(i.total)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold ring-1 ring-slate-200">
                        {INVOICE_STATUS_LABELS[i.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-sky-700 hover:underline"
                          onClick={() => showToast('PDF export (mock)')}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-sky-700 hover:underline"
                          onClick={() => showToast('Email sent (mock)')}
                        >
                          Email
                        </button>
                        {i.status !== 'cancelled' && i.status !== 'paid' ? (
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-rose-700 hover:underline"
                            onClick={() => setStatus.mutate({ id: i.id, status: 'cancelled' })}
                          >
                            Cancel
                          </button>
                        ) : null}
                        {i.status === 'cancelled' ? null : (
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-amber-800 hover:underline"
                            onClick={() => setStatus.mutate({ id: i.id, status: 'reissued' })}
                          >
                            Reissue
                          </button>
                        )}
                        {i.status === 'draft' ? (
                          <button
                            type="button"
                            className="text-[11px] font-semibold text-emerald-700 hover:underline"
                            onClick={() => setStatus.mutate({ id: i.id, status: 'sent' as InvoiceStatus })}
                          >
                            Send
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel p-4">
            <p className="text-[11px] font-bold uppercase text-slate-500">Lines</p>
            <h2 className="mt-1 font-mono text-lg font-semibold">{selected.invoiceNumber}</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {selected.lines.map((l) => (
                <li key={l.description} className="flex justify-between gap-2">
                  <span className="text-slate-600">{l.description}</span>
                  <span className="font-semibold">{formatMoney(l.amount)}</span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>

      {genOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-heading text-lg font-semibold">Generate from customer bill</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {(billsQ.data ?? []).map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-sky-50"
                    onClick={async () => {
                      await generate.mutateAsync(b.id)
                      setGenOpen(false)
                      showToast(`Invoice ${b.invoiceNumber} ready`)
                    }}
                  >
                    <span>
                      {b.customer} · {b.invoiceNumber}
                    </span>
                    <span className="font-semibold">{formatMoney(b.total)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 w-full cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold"
              onClick={() => setGenOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
