import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, KpiCard, StatusBadge } from '@/components/enterprise/OutboundUi'
import { useAllocateFeBay, useFeBays, useFeQueue, useFieldExecutives } from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'
import { Users, Warehouse } from 'lucide-react'

export function FeBayPage() {
  const baysQ = useFeBays()
  const queueQ = useFeQueue()
  const fesQ = useFieldExecutives()
  const allocate = useAllocateFeBay()
  const toast = useToastStore((s) => s.push)
  const [feByBay, setFeByBay] = useState<Record<string, string>>({})

  const bays = baysQ.data ?? []
  const queue = queueQ.data ?? []
  const fes = fesQ.data ?? []
  const freeBays = bays.filter((b) => b.status === 'FREE').length
  const loadingBays = bays.filter((b) => b.status === 'LOADING').length

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'FE bays' }]} />
      <PageHeader
        title="FE bay board"
        description="Allocate loading bays to field executives and monitor the FE queue."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Free bays" value={freeBays} icon={Warehouse} tone="success" />
        <KpiCard label="Loading now" value={loadingBays} tone="info" />
        <KpiCard label="FE queue" value={queue.length} icon={Users} tone="warn" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {bays.map((bay) => {
          const fe = fes.find((f) => f.id === bay.feId)
          return (
            <div key={bay.id} className="surface-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg">{bay.code}</h3>
                <StatusBadge
                  label={bay.status}
                  tone={bay.status === 'FREE' ? 'green' : bay.status === 'LOADING' ? 'violet' : 'amber'}
                />
              </div>
              <p className="mt-1 text-sm text-slate-600">{bay.name}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${bay.utilizationPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {bay.utilizationPct}% · {bay.bagIds.length} bag(s) · FE {fe?.name ?? '—'}
              </p>
              {bay.status === 'FREE' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <select
                    value={feByBay[bay.id] ?? ''}
                    onChange={(e) => setFeByBay((prev) => ({ ...prev, [bay.id]: e.target.value }))}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="">Select FE…</option>
                    {fes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                    disabled={!feByBay[bay.id] || allocate.isPending}
                    onClick={async () => {
                      const feId = feByBay[bay.id]
                      if (!feId) return
                      try {
                        await allocate.mutateAsync({ bayId: bay.id, feId })
                        const feName = fes.find((f) => f.id === feId)?.name
                        toast(`Bay ${bay.code} allocated to ${feName}`)
                      } catch (e) {
                        toast((e as Error).message, 'error')
                      }
                    }}
                  >
                    Allocate bay
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="font-heading text-base">FE queue summary</h2>
        <ul className="mt-3 space-y-2">
          {queue.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{item.feName}</p>
                <p className="text-xs text-slate-500">
                  {item.bagCount} bags · {item.parcelCount} parcels · Bay {item.bayId ?? '—'}
                </p>
              </div>
              <StatusBadge
                label={item.status.replace(/_/g, ' ')}
                tone={item.status === 'OUT_FOR_DELIVERY' ? 'green' : item.status === 'LOADING' ? 'violet' : 'amber'}
              />
            </li>
          ))}
          {!queue.length ? <p className="text-sm text-slate-500">Queue is empty.</p> : null}
        </ul>
      </section>
    </div>
  )
}
