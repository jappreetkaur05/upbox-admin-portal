import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCycleCounts, useRecordCycleCount } from '@/hooks/useInventoryAdmin'
import { cn } from '@/lib/cn'

export function CycleCountPage() {
  const cycleQ = useCycleCounts()
  const record = useRecordCycleCount()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const plans = cycleQ.data ?? []
  const done = plans.filter((p) => p.status === 'done').length

  return (
    <div>
      <PageHeader
        title="Cycle Count"
        description="Count a portion of the warehouse regularly — no need to shut down for a full audit."
      />

      <div className="mb-4 surface-panel p-4">
        <p className="text-sm font-semibold text-slate-800">
          This week progress: {done} / {plans.length} areas counted
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-500"
            style={{ width: `${plans.length ? (done / plans.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {cycleQ.isLoading ? <LoadingPanel label="Loading cycle counts…" /> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className="surface-panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-500">{p.dayLabel}</p>
                <h2 className="font-heading text-base text-slate-900">{p.scope}</h2>
              </div>
              <span
                className={cn(
                  'rounded-lg px-2 py-1 text-[10px] font-bold capitalize',
                  p.status === 'done' && 'bg-emerald-50 text-emerald-800',
                  p.status === 'in_progress' && 'bg-amber-50 text-amber-900',
                  p.status === 'planned' && 'bg-slate-100 text-slate-600'
                )}
              >
                {p.status.replace('_', ' ')}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">System qty: {p.systemQty}</p>
            {p.status === 'done' ? (
              <p className="mt-1 text-sm font-semibold text-slate-800">Actual: {p.actualQty}</p>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  className="surface-input flex-1 px-2 py-1.5 text-sm"
                  placeholder="Actual count"
                  value={drafts[p.id] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                />
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                  disabled={record.isPending || !drafts[p.id]}
                  onClick={() =>
                    void record.mutateAsync({ id: p.id, actualQty: Number(drafts[p.id]) })
                  }
                >
                  Save
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
