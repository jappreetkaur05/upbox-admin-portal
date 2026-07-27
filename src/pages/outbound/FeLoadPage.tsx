import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { useFeQueue } from '@/hooks/useOutbound'
import { cn } from '@/lib/cn'

export function FeLoadPage() {
  const queueQ = useFeQueue()
  const queue = queueQ.data ?? []

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'FE load' }]} />
      <PageHeader
        title="FE loading queue"
        description="Track parcel capacity and loaded counts for each field executive."
      />

      <div className="grid gap-4">
        {queue.map((item) => {
          const pct = item.capacityParcels > 0 ? Math.round((item.loadedParcels / item.capacityParcels) * 100) : 0
          const full = item.loadedParcels >= item.capacityParcels
          return (
            <section key={item.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg">{item.feName}</h3>
                  <p className="text-xs text-slate-500">
                    {item.bagCount} bag(s) · {item.parcelCount} parcel(s) in queue
                    {item.bayId ? ` · Bay ${item.bayId}` : ''}
                  </p>
                </div>
                <StatusBadge
                  label={item.status.replace(/_/g, ' ')}
                  tone={item.status === 'OUT_FOR_DELIVERY' ? 'green' : item.status === 'LOADING' ? 'violet' : 'amber'}
                />
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Loaded {item.loadedParcels} / {item.capacityParcels}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      full ? 'bg-emerald-500' : pct > 70 ? 'bg-amber-500' : 'bg-primary-500'
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase text-slate-500">Capacity</p>
                  <p className="font-heading text-xl">{item.capacityParcels}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase text-slate-500">Loaded</p>
                  <p className="font-heading text-xl">{item.loadedParcels}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-[11px] uppercase text-slate-500">Remaining</p>
                  <p className="font-heading text-xl">{Math.max(0, item.capacityParcels - item.loadedParcels)}</p>
                </div>
              </div>
            </section>
          )
        })}
        {!queue.length && !queueQ.isLoading ? (
          <p className="text-sm text-slate-500">No FEs in the loading queue.</p>
        ) : null}
      </div>
    </div>
  )
}
