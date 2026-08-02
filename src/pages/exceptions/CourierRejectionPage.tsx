import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateCourierRejection, useExceptionCases } from '@/hooks/useExceptionsAdmin'
import {
  COURIER_REASON_LABELS,
  EXCEPTION_STATUS_LABELS,
  type CourierRejectReason,
} from '@/types/exceptionsAdmin'

export function CourierRejectionPage() {
  const casesQ = useExceptionCases('courier_rejection')
  const create = useCreateCourierRejection()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    shipmentId: 'SHP-',
    orderId: 'OB-2026-',
    courier: 'UPBOX',
    reason: 'packaging' as CourierRejectReason,
    assignee: '',
  })

  return (
    <div>
      <PageHeader
        title="Courier Rejection"
        description="Shipments rejected by courier — packaging, labels, weight, or address."
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
              Log rejection
            </button>
          </div>
        }
      />

      {casesQ.isLoading ? <LoadingPanel label="Loading rejections…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Exception</th>
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Courier</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(casesQ.data ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.exceptionId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.courier?.shipmentId}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{c.courier?.orderId}</td>
                  <td className="px-4 py-3 text-xs font-semibold">{c.courier?.courier}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.courier ? COURIER_REASON_LABELS[c.courier.reason] : '—'}
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
              <h3 className="font-heading text-lg font-semibold">Log courier rejection</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {(
                [
                  ['shipmentId', 'Shipment ID'],
                  ['orderId', 'Order ID'],
                  ['courier', 'Courier'],
                  ['assignee', 'Assignee (optional)'],
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
                Reason
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value as CourierRejectReason })
                  }
                >
                  {(Object.keys(COURIER_REASON_LABELS) as CourierRejectReason[]).map((k) => (
                    <option key={k} value={k}>
                      {COURIER_REASON_LABELS[k]}
                    </option>
                  ))}
                </select>
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
