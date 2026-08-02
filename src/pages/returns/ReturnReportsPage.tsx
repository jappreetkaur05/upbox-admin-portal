import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { returnsAdminService } from '@/services/returnsAdmin.service'
import { useRefunds, useReturnDamages, useReturnOrders, useRtoCases } from '@/hooks/useReturnsAdmin'
import { RETURN_REASON_LABELS } from '@/types/returnsAdmin'
import { formatMoney } from '@/lib/cn'

export function ReturnReportsPage() {
  const ordersQ = useReturnOrders()
  const rtoQ = useRtoCases()
  const dmgQ = useReturnDamages()
  const refundsQ = useRefunds()
  const snap = returnsAdminService.reportSnapshot()

  const maxReason = Math.max(1, ...snap.reasonBreakdown.map((r) => r.count))

  return (
    <div>
      <PageHeader
        title="Return Reports"
        description="Return rate, RTO rate, reasons, damage, and refund summary."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/returns/orders"
          className="surface-panel block p-4 transition hover:ring-2 hover:ring-sky-200"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Total returns
          </p>
          <p className="mt-1 font-heading text-3xl font-semibold text-slate-900">
            {ordersQ.data?.length ?? snap.totalReturns}
          </p>
          <p className="mt-1 text-xs text-slate-500">Return rate {snap.returnRatePct}%</p>
        </Link>
        <Link
          to="/returns/rto"
          className="surface-panel block p-4 transition hover:ring-2 hover:ring-amber-200"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">RTO cases</p>
          <p className="mt-1 font-heading text-3xl font-semibold text-slate-900">
            {rtoQ.data?.length ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">RTO rate {snap.rtoRatePct}%</p>
        </Link>
        <Link
          to="/returns/damage"
          className="surface-panel block p-4 transition hover:ring-2 hover:ring-rose-200"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700">
            Damaged returns
          </p>
          <p className="mt-1 font-heading text-3xl font-semibold text-slate-900">
            {dmgQ.data?.length ?? snap.damagedReturns}
          </p>
        </Link>
        <Link
          to="/returns/refunds"
          className="surface-panel block p-4 transition hover:ring-2 hover:ring-emerald-200"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Refunds completed
          </p>
          <p className="mt-1 font-heading text-3xl font-semibold text-slate-900">
            {snap.refundsCompleted}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatMoney(snap.refundTotalCompleted)} · {snap.refundsPending} pending
          </p>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold text-slate-900">Return reasons</h2>
          <p className="mt-0.5 text-xs text-slate-500">Breakdown across all return orders</p>
          <ul className="mt-4 space-y-3">
            {snap.reasonBreakdown.map((r) => (
              <li key={r.reason}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {RETURN_REASON_LABELS[r.reason]}
                  </span>
                  <span className="font-semibold text-slate-900">{r.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(r.count / maxReason) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold text-slate-900">Refund summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Open refunds</dt>
              <dd className="font-semibold">{snap.refundsPending}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Completed</dt>
              <dd className="font-semibold">{snap.refundsCompleted}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Completed value</dt>
              <dd className="font-semibold">{formatMoney(snap.refundTotalCompleted)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total refund rows</dt>
              <dd className="font-semibold">{refundsQ.data?.length ?? 0}</dd>
            </div>
          </dl>
          <Link
            to="/returns/refunds"
            className="mt-6 inline-flex cursor-pointer text-xs font-bold text-sky-700 hover:underline"
          >
            View refund status →
          </Link>
        </section>
      </div>
    </div>
  )
}
