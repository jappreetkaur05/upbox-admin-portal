import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import {
  useAssignBagToFe,
  useFieldExecutives,
  useReleaseBagToFe,
  useRouteBags,
} from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'

export function AssignFePage() {
  const bagsQ = useRouteBags()
  const fesQ = useFieldExecutives()
  const assign = useAssignBagToFe()
  const release = useReleaseBagToFe()
  const toast = useToastStore((s) => s.push)
  const [feByBag, setFeByBag] = useState<Record<string, string>>({})

  const sealedBags = (bagsQ.data ?? []).filter((b) => b.status === 'SEALED')
  const assignedBags = (bagsQ.data ?? []).filter((b) => b.status === 'ASSIGNED')
  const fes = fesQ.data ?? []

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Assign FE' }]} />
      <PageHeader
        title="Assign field executive"
        description="Assign sealed route bags to field executives as whole-bag handoffs."
      />

      <section className="surface-card mb-6 p-5">
        <h2 className="font-heading text-base">Sealed bags — assign to FE</h2>
        <ul className="mt-3 space-y-3">
          {sealedBags.map((bag) => (
            <li key={bag.id} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{bag.bagBarcode}</p>
                  <p className="text-xs text-slate-500">
                    {bag.routeName} · {bag.orderIds.length} orders
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label="Sealed" tone="green" />
                  <select
                    value={feByBag[bag.id] ?? ''}
                    onChange={(e) => setFeByBag((prev) => ({ ...prev, [bag.id]: e.target.value }))}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="">Select FE…</option>
                    {fes.map((fe) => (
                      <option key={fe.id} value={fe.id}>
                        {fe.name} ({fe.employeeId})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                    disabled={!feByBag[bag.id] || assign.isPending}
                    onClick={async () => {
                      const feId = feByBag[bag.id]
                      if (!feId) return
                      try {
                        const updated = await assign.mutateAsync({ bagId: bag.id, feId })
                        toast(`Bag assigned to ${updated.feName}`, 'success')
                      } catch (e) {
                        toast((e as Error).message, 'error')
                      }
                    }}
                  >
                    Assign bag to FE
                  </button>
                </div>
              </div>
            </li>
          ))}
          {!sealedBags.length ? (
            <p className="text-sm text-slate-500">No sealed bags waiting for FE assignment.</p>
          ) : null}
        </ul>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-heading text-base">Assigned bags — release to FE</h2>
        <ul className="mt-3 space-y-3">
          {assignedBags.map((bag) => (
            <li key={bag.id} className="rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{bag.bagBarcode}</p>
                  <p className="text-xs text-slate-500">
                    {bag.routeName} · FE {bag.feName} · {bag.orderIds.length} orders
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label="Assigned" tone="amber" />
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    disabled={release.isPending}
                    onClick={async () => {
                      try {
                        await release.mutateAsync(bag.id)
                        toast(`Bag ${bag.bagBarcode} released to ${bag.feName}`, 'success')
                      } catch (e) {
                        toast((e as Error).message, 'error')
                      }
                    }}
                  >
                    Release to FE
                  </button>
                </div>
              </div>
            </li>
          ))}
          {!assignedBags.length ? (
            <p className="text-sm text-slate-500">No assigned bags pending release.</p>
          ) : null}
        </ul>
      </section>
    </div>
  )
}
