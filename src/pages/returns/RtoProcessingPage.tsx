import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useAdvanceRto, useRtoCases } from '@/hooks/useReturnsAdmin'
import {
  RTO_PIPELINE,
  RTO_REASON_LABELS,
  RTO_STEP_LABELS,
  type RtoPipelineStep,
} from '@/types/returnsAdmin'
import { cn } from '@/lib/cn'

export function RtoProcessingPage() {
  const rtoQ = useRtoCases()
  const advance = useAdvanceRto()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = (rtoQ.data ?? []).find((r) => r.id === selectedId) ?? null

  return (
    <div>
      <PageHeader
        title="RTO Processing"
        description="Orders returned after failed delivery — inspect, QC, then restock or damage handling."
      />

      {rtoQ.isLoading ? <LoadingPanel label="Loading RTO…" /> : null}

      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-[1fr_360px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">RTO ID</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Step</th>
                  <th className="px-4 py-3">Linked return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(rtoQ.data ?? []).map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedId(row.id === selectedId ? null : row.id)}
                    className={cn(
                      'cursor-pointer hover:bg-sky-50/50',
                      selected?.id === row.id && 'bg-sky-50'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{row.rtoId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.orderId}</td>
                    <td className="px-4 py-3 font-medium">{row.customer}</td>
                    <td className="px-4 py-3 text-xs">{RTO_REASON_LABELS[row.reason]}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
                        {RTO_STEP_LABELS[row.step]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-sky-700">
                      {row.linkedReturnId ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel p-4">
            <p className="text-[11px] font-bold uppercase text-slate-500">Pipeline</p>
            <h2 className="mt-1 font-heading text-lg">{selected.rtoId}</h2>
            <p className="text-xs text-slate-500">{selected.customer}</p>

            <ol className="mt-4 space-y-2">
              {RTO_PIPELINE.map((step: RtoPipelineStep, i) => {
                const cur = RTO_PIPELINE.indexOf(selected.step)
                const done = i <= cur
                return (
                  <li
                    key={step}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs',
                      done
                        ? 'border-sky-200 bg-sky-50 font-semibold text-sky-900'
                        : 'border-slate-100 text-slate-400'
                    )}
                  >
                    {i + 1}. {RTO_STEP_LABELS[step]}
                  </li>
                )
              })}
            </ol>

            <div className="mt-4 flex flex-col gap-2">
              {selected.step !== 'closed' ? (
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => advance.mutate(selected.id)}
                >
                  Advance step
                </button>
              ) : null}
              <Link
                to="/returns/inspection"
                className="cursor-pointer rounded-xl border px-4 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Open inspection
              </Link>
              <Link
                to="/returns/restock"
                className="cursor-pointer rounded-xl border px-4 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Restock queue
              </Link>
              <Link
                to="/returns/damage"
                className="cursor-pointer rounded-xl border px-4 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Damage handling
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
