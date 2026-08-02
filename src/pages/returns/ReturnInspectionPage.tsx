import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useReturnInspections, useSubmitInspection } from '@/hooks/useReturnsAdmin'
import {
  INSPECTION_OUTCOME_LABELS,
  type InspectionChecks,
  type InspectionOutcome,
} from '@/types/returnsAdmin'
import { cn } from '@/lib/cn'

const CHECK_LABELS: { key: keyof InspectionChecks; label: string }[] = [
  { key: 'correctProduct', label: 'Correct product' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'signsOfUse', label: 'Signs of use' },
  { key: 'accessories', label: 'Accessories' },
]

export function ReturnInspectionPage() {
  const inspQ = useReturnInspections()
  const submit = useSubmitInspection()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checks, setChecks] = useState<InspectionChecks>({
    correctProduct: false,
    quantity: false,
    packaging: false,
    signsOfUse: false,
    accessories: false,
  })
  const [outcome, setOutcome] = useState<InspectionOutcome>('pending')
  const [notes, setNotes] = useState('')

  const rows = useMemo(() => inspQ.data ?? [], [inspQ.data])
  const selected = rows.find((r) => r.id === selectedId) ?? null

  const openRow = (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return
    setSelectedId(id)
    setChecks({ ...row.checks })
    setOutcome(row.outcome)
    setNotes(row.notes)
  }

  return (
    <div>
      <PageHeader
        title="Return Inspection"
        description="Inspect returned products after they arrive — product, qty, packaging, use, accessories."
      />

      {inspQ.isLoading ? <LoadingPanel label="Loading inspections…" /> : null}

      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-[1fr_380px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Return ID</th>
                  <th className="px-4 py-3">Inspector</th>
                  <th className="px-4 py-3">Checks passed</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const passed = Object.values(r.checks).filter(Boolean).length
                  return (
                    <tr
                      key={r.id}
                      onClick={() => openRow(r.id)}
                      className={cn(
                        'cursor-pointer hover:bg-sky-50/50',
                        selected?.id === r.id && 'bg-sky-50'
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{r.returnId}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{r.inspector}</td>
                      <td className="px-4 py-3 text-xs font-semibold">
                        {passed}/5
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold ring-1 ring-slate-200">
                          {INSPECTION_OUTCOME_LABELS[r.outcome]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(r.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden">
            <div className="border-b px-4 py-3">
              <p className="text-[11px] font-bold uppercase text-slate-500">Inspection</p>
              <h2 className="font-mono text-lg font-semibold">{selected.returnId}</h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {CHECK_LABELS.map(({ key, label }) => (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checks[key]}
                    onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {label}
                </label>
              ))}
              <label className="block text-xs font-semibold text-slate-600">
                Outcome
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as InspectionOutcome)}
                >
                  {(Object.keys(INSPECTION_OUTCOME_LABELS) as InspectionOutcome[]).map((k) => (
                    <option key={k} value={k}>
                      {INSPECTION_OUTCOME_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Notes
                <textarea
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 border-t px-4 py-3">
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={async () => {
                  await submit.mutateAsync({
                    returnId: selected.returnId,
                    checks,
                    outcome,
                    notes,
                  })
                }}
              >
                Save
              </button>
              {outcome === 'sent_for_qc' ? (
                <Link
                  to="/returns/qc"
                  className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50"
                >
                  Open QC
                </Link>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
