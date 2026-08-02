import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useRefunds, useUpdateRefundStatus } from '@/hooks/useReturnsAdmin'
import { REFUND_STATUS_LABELS, type RefundStatus } from '@/types/returnsAdmin'
import { cn, formatMoney } from '@/lib/cn'

export function RefundStatusPage() {
  const refundsQ = useRefunds()
  const update = useUpdateRefundStatus()
  const [status, setStatus] = useState('')

  const rows = useMemo(() => {
    let list = refundsQ.data ?? []
    if (status) list = list.filter((r) => r.status === status)
    return list
  }, [refundsQ.data, status])

  return (
    <div>
      <PageHeader
        title="Refund Status"
        description="Track refund progress — amount, method, date, and reference."
      />

      <div className="mb-4">
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {(Object.keys(REFUND_STATUS_LABELS) as RefundStatus[]).map((k) => (
            <option key={k} value={k}>
              {REFUND_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {refundsQ.isLoading ? <LoadingPanel label="Loading refunds…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{row.returnId}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(row.amount)}</td>
                  <td className="px-4 py-3 text-xs uppercase text-slate-600">{row.method}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.referenceId}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-bold ring-1',
                        row.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : row.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 ring-rose-200'
                            : 'bg-amber-50 text-amber-900 ring-amber-200'
                      )}
                    >
                      {REFUND_STATUS_LABELS[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="surface-input cursor-pointer px-2 py-1.5 text-xs"
                      value={row.status}
                      onChange={async (e) => {
                        await update.mutateAsync({
                          id: row.id,
                          status: e.target.value as RefundStatus,
                        })
                      }}
                    >
                      {(Object.keys(REFUND_STATUS_LABELS) as RefundStatus[]).map((k) => (
                        <option key={k} value={k}>
                          {REFUND_STATUS_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !refundsQ.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No refunds for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
