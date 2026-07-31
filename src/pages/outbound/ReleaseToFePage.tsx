import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import { useFeBays, useFeQueue, useReleaseBagToFe, useRouteBags } from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

export function ReleaseToFePage() {
  const bagsQ = useRouteBags()
  const queueQ = useFeQueue()
  const baysQ = useFeBays()
  const release = useReleaseBagToFe()
  const toast = useToastStore((s) => s.push)
  const [bayByBag, setBayByBag] = useState<Record<string, string>>({})

  const readyToRelease = (bagsQ.data ?? []).filter((b) => b.status === 'ASSIGNED')
  const freeBays = (baysQ.data ?? []).filter((b) => b.status === 'FREE')

  const loadByFe = useMemo(() => {
    const map = new Map((queueQ.data ?? []).map((q) => [q.feId, q]))
    return map
  }, [queueQ.data])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Release to FE' }]} />
      <PageHeader
        title="Release to field executive"
        description="Confirm load progress, then release assigned bags so the FE can leave."
      />

      <OutboundChrome
        what="Clear assigned bags out of the warehouse."
        doNow={
          readyToRelease.length
            ? `${readyToRelease.length} bag(s) assigned and ready to release.`
            : 'No assigned bags — assign sealed bags to a verified FE first.'
        }
        nextLabel="Next: In-field"
        nextTo="/outbound/in-field"
      >
        <div className="grid gap-4">
          {readyToRelease.map((bag) => {
            const load = bag.feId ? loadByFe.get(bag.feId) : undefined
            const pct =
              load && load.capacityParcels > 0
                ? Math.round((load.loadedParcels / load.capacityParcels) * 100)
                : 0
            return (
              <section key={bag.id} className="surface-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-lg">{bag.bagBarcode}</h3>
                    <p className="text-sm text-slate-600">
                      {bag.routeName} · {bag.routeCode}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      FE <span className="font-semibold">{bag.feName}</span> · {bag.orderIds.length} orders
                      {bag.feBayId ? ` · Bay ${bag.feBayId}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label="Ready to release" tone="amber" />
                    {!bag.feBayId ? (
                      <select
                        value={bayByBag[bag.id] ?? ''}
                        onChange={(e) => setBayByBag((prev) => ({ ...prev, [bag.id]: e.target.value }))}
                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                      >
                        <option value="">Pick bay…</option>
                        {freeBays.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.code}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                      disabled={release.isPending}
                      onClick={async () => {
                        try {
                          await release.mutateAsync({
                            bagId: bag.id,
                            feBayId: bayByBag[bag.id] || bag.feBayId || undefined,
                          })
                          toast(`Released ${bag.bagBarcode} to ${bag.feName}`, 'success')
                        } catch (e) {
                          toast((e as Error).message, 'error')
                        }
                      }}
                    >
                      Release bag to FE
                    </button>
                  </div>
                </div>

                {load ? (
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                      <span>
                        Load {load.loadedParcels} / {load.capacityParcels}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          pct >= 100 ? 'bg-emerald-500' : pct > 70 ? 'bg-amber-500' : 'bg-primary-500'
                        )}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">No load queue row for this FE yet — release will create in-field tracking.</p>
                )}

                <ul className="mt-4 flex flex-wrap gap-2">
                  {bag.orderIds.map((oid) => (
                    <li key={oid} className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600">
                      {oid}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
          {!readyToRelease.length && !bagsQ.isLoading ? (
            <p className="text-sm text-slate-500">
              No bags ready for release —{' '}
              <Link className="font-semibold text-primary-700 underline" to="/outbound/assign-fe">
                assign sealed bags
              </Link>{' '}
              first.
            </p>
          ) : null}
        </div>
      </OutboundChrome>
    </div>
  )
}
