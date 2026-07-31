import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import {
  useAssignBagToFe,
  useFeBays,
  useFeCheckIns,
  useFieldExecutives,
  useRouteBags,
} from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'

export function AssignFePage() {
  const bagsQ = useRouteBags()
  const fesQ = useFieldExecutives()
  const checkInsQ = useFeCheckIns()
  const baysQ = useFeBays()
  const assign = useAssignBagToFe()
  const toast = useToastStore((s) => s.push)
  const [feByBag, setFeByBag] = useState<Record<string, string>>({})
  const [bayByBag, setBayByBag] = useState<Record<string, string>>({})

  const sealedBags = (bagsQ.data ?? []).filter((b) => b.status === 'SEALED')
  const assignedBags = (bagsQ.data ?? []).filter((b) => b.status === 'ASSIGNED')
  const verifiedFeIds = useMemo(
    () => new Set((checkInsQ.data ?? []).filter((c) => c.status === 'VERIFIED').map((c) => c.feId)),
    [checkInsQ.data]
  )
  const verifiedFes = (fesQ.data ?? []).filter((fe) => verifiedFeIds.has(fe.id))
  const freeBays = (baysQ.data ?? []).filter((b) => b.status === 'FREE')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Assign FE' }]} />
      <PageHeader
        title="Assign field executive"
        description="Give sealed bags to verified FEs only. Release happens on the next step."
      />

      <OutboundChrome
        what="Assign sealed bags to FEs who already checked in."
        doNow={
          !verifiedFes.length
            ? 'No verified FEs — go to Check-in first.'
            : sealedBags.length
              ? `${sealedBags.length} sealed bag(s) waiting for assignment.`
              : 'No sealed bags — sort/seal on Route bags first.'
        }
        nextLabel="Next: Release to FE"
        nextTo="/outbound/release-fe"
      >
        {!verifiedFes.length ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No verified FEs.{' '}
            <Link className="font-semibold underline" to="/outbound/fe-checkin">
              Go to Check-in
            </Link>
          </div>
        ) : null}

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
                      <option value="">Select verified FE…</option>
                      {verifiedFes.map((fe) => (
                        <option key={fe.id} value={fe.id}>
                          {fe.name} ({fe.employeeId})
                        </option>
                      ))}
                    </select>
                    <select
                      value={bayByBag[bag.id] ?? ''}
                      onChange={(e) => setBayByBag((prev) => ({ ...prev, [bag.id]: e.target.value }))}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    >
                      <option value="">Bay (optional)…</option>
                      {freeBays.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      disabled={!feByBag[bag.id] || assign.isPending || !verifiedFes.length}
                      onClick={async () => {
                        const feId = feByBag[bag.id]
                        if (!feId) return
                        try {
                          const updated = await assign.mutateAsync({
                            bagId: bag.id,
                            feId,
                            feBayId: bayByBag[bag.id] || undefined,
                          })
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
          <h2 className="font-heading text-base">Assigned — waiting for release</h2>
          <p className="mt-1 text-xs text-slate-500">
            Release is done on{' '}
            <Link className="font-semibold text-primary-700 underline" to="/outbound/release-fe">
              Release to FE
            </Link>
            .
          </p>
          <ul className="mt-3 space-y-2">
            {assignedBags.map((bag) => (
              <li key={bag.id} className="rounded-xl border border-amber-200 bg-amber-50/40 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{bag.bagBarcode}</p>
                    <p className="text-xs text-slate-500">
                      {bag.routeName} · FE {bag.feName} · {bag.orderIds.length} orders
                    </p>
                  </div>
                  <StatusBadge label="Assigned" tone="amber" />
                </div>
              </li>
            ))}
            {!assignedBags.length ? (
              <p className="text-sm text-slate-500">No assigned bags yet.</p>
            ) : null}
          </ul>
        </section>
      </OutboundChrome>
    </div>
  )
}
