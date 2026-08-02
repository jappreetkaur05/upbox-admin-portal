import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { usePayments, useUpdatePaymentStatus } from '@/hooks/useFinanceAdmin'
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentStatus,
} from '@/types/financeAdmin'
import { cn, formatMoney } from '@/lib/cn'

export function PaymentTrackingPage() {
  const payQ = usePayments()
  const update = useUpdatePaymentStatus()
  const [status, setStatus] = useState('')
  const [direction, setDirection] = useState('')

  const rows = useMemo(() => {
    let list = payQ.data ?? []
    if (status) list = list.filter((p) => p.status === status)
    if (direction) list = list.filter((p) => p.direction === direction)
    return list
  }, [payQ.data, status, direction])

  return (
    <div>
      <PageHeader
        title="Payment Tracking"
        description="Incoming and outgoing payments — pending, partial, paid, overdue, failed."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
        >
          <option value="">All directions</option>
          <option value="in">Incoming</option>
          <option value="out">Outgoing</option>
        </select>
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((k) => (
            <option key={k} value={k}>
              {PAYMENT_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {payQ.isLoading ? <LoadingPanel label="Loading payments…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Dir</th>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ring-1',
                        p.direction === 'in'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-amber-50 text-amber-900 ring-amber-200'
                      )}
                    >
                      {p.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{p.party}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(p.amount)}</td>
                  <td className="px-4 py-3 text-xs">{PAYMENT_METHOD_LABELS[p.method]}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(p.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.ref}</td>
                  <td className="px-4 py-3">
                    <select
                      className="surface-input cursor-pointer px-2 py-1.5 text-xs"
                      value={p.status}
                      onChange={async (e) => {
                        await update.mutateAsync({
                          id: p.id,
                          status: e.target.value as PaymentStatus,
                        })
                      }}
                    >
                      {(Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]).map((k) => (
                        <option key={k} value={k}>
                          {PAYMENT_STATUS_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
