import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { useConfirmPickStop, usePickLists, useRaiseException } from '@/hooks/useOutbound'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/cn'
import type { PickList } from '@/types/outbound'

function listProgress(pl: PickList) {
  const done = pl.stops.filter((s) => s.done).length
  return { done, total: pl.stops.length }
}

export function PickingPage() {
  const listsQ = usePickLists()
  const confirm = useConfirmPickStop()
  const raise = useRaiseException()
  const toast = useToastStore((s) => s.push)
  const user = useAuthStore((s) => s.user)
  const isPicker = user?.roles?.includes('PICKER') ?? false
  const workerId = user?.workerId ?? null

  const [showComplete, setShowComplete] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeLists = useMemo(
    () => (listsQ.data ?? []).filter((p) => p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS'),
    [listsQ.data]
  )

  const completeLists = useMemo(
    () => (listsQ.data ?? []).filter((p) => p.status === 'COMPLETE'),
    [listsQ.data]
  )

  const visibleLists = showComplete ? [...activeLists, ...completeLists] : activeLists

  useEffect(() => {
    if (selectedId && visibleLists.some((p) => p.id === selectedId)) return
    if (isPicker && workerId) {
      const mine = activeLists.find((p) => p.pickerId === workerId)
      if (mine) {
        setSelectedId(mine.id)
        return
      }
    }
    setSelectedId(activeLists[0]?.id ?? completeLists[0]?.id ?? null)
  }, [activeLists, completeLists, visibleLists, selectedId, isPicker, workerId])

  const active = visibleLists.find((p) => p.id === selectedId) ?? null
  const { done, total } = active ? listProgress(active) : { done: 0, total: 0 }
  const next = active?.stops.find((s) => !s.done)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Picking' }]} />
      <PageHeader
        title="Picking dashboard"
        description="Select your pick list, confirm stops in sequence, and raise exceptions when needed."
        actions={
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={showComplete} onChange={(e) => setShowComplete(e.target.checked)} />
            Show completed lists
          </label>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {visibleLists.length === 0 ? (
          <p className="text-sm text-slate-500">No active pick lists — check back when waves are released.</p>
        ) : (
          visibleLists.map((pl) => {
            const prog = listProgress(pl)
            const isComplete = pl.status === 'COMPLETE'
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => setSelectedId(pl.id)}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border px-4 py-2 text-left text-sm transition',
                  selectedId === pl.id
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : isComplete
                      ? 'border-slate-100 bg-slate-50/80 text-slate-500 hover:border-slate-200'
                      : 'border-slate-200 bg-white hover:border-primary-200'
                )}
              >
                <span>
                  <span className="font-semibold">{pl.pickerName ?? 'Unassigned'}</span>
                  <span className="ml-2 font-mono text-xs text-slate-500">
                    {prog.done}/{prog.total}
                  </span>
                </span>
                {isComplete ? (
                  <StatusBadge label="Complete" tone="green" />
                ) : (
                  <StatusBadge label={pl.status === 'IN_PROGRESS' ? 'In progress' : 'Assigned'} tone="blue" />
                )}
              </button>
            )
          })
        )}
      </div>

      {active ? (
        <p className="mb-4 text-xs text-slate-500">
          List <span className="font-mono font-semibold">{active.id}</span> · Wave {active.waveId} ·{' '}
          {done}/{total} stops done
        </p>
      ) : null}

      {next ? (
        <section className="mb-6 overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700">Next stop #{next.sequence}</p>
          <h2 className="mt-1 font-heading text-2xl text-slate-900">{next.locationCode}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[
              ['Rack', next.rack],
              ['Shelf', next.shelf],
              ['Bin', next.bin],
              ['Qty', String(next.qty)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/80 p-3 shadow-sm">
                <p className="text-[11px] uppercase text-slate-500">{k}</p>
                <p className="font-heading text-lg">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-700">
            <span className="font-semibold">{next.sku}</span> — {next.name}
          </p>
          <p className="text-xs text-slate-500">Scan barcode {next.barcode}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
              disabled={confirm.isPending}
              onClick={async () => {
                if (!active) return
                try {
                  await confirm.mutateAsync({ pickListId: active.id, stopId: next.id })
                  toast('Pick confirmed')
                } catch (e) {
                  toast((e as Error).message, 'error')
                }
              }}
            >
              Confirm pick
            </button>
            <button
              type="button"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
              disabled={raise.isPending}
              onClick={async () => {
                try {
                  await raise.mutateAsync({
                    orderId: next.orderId,
                    orderNumber: next.orderId,
                    lineId: next.lineId,
                    sku: next.sku,
                    type: 'SHORT_PICK',
                    notes: 'Raised from picking dashboard',
                    raisedBy: active?.pickerName ?? 'Picker',
                  })
                  toast('Exception raised', 'error')
                } catch (e) {
                  toast((e as Error).message, 'error')
                }
              }}
            >
              Raise exception
            </button>
          </div>
        </section>
      ) : active ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          All stops complete on this list.
        </div>
      ) : null}

      {active ? (
        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="font-heading text-sm">Stop sequence</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {active.stops.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-8 font-mono text-xs text-slate-400">{s.sequence}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.locationCode}</p>
                  <p className="text-xs text-slate-500">
                    {s.sku} · Rack {s.rack} / Shelf {s.shelf} / Bin {s.bin} · qty {s.qtyPicked}/{s.qty}
                  </p>
                </div>
                <StatusBadge label={s.done ? 'Done' : 'Open'} tone={s.done ? 'green' : 'slate'} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
