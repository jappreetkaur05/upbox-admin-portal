import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import {
  useCompletePack,
  useGenerateLabel,
  useOutboundOrders,
  usePackStations,
  usePrintLabel,
  useRecommendPackage,
  useShippingLabels,
  useStartPack,
  useValidatePack,
} from '@/hooks/useOutbound'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'

export function PackingStationsPage() {
  const stationsQ = usePackStations()
  const pickedQ = useOutboundOrders({ status: 'PICKED' })
  const packingQ = useOutboundOrders({ status: 'PACKING' })
  const labelsQ = useShippingLabels()
  const start = useStartPack()
  const validate = useValidatePack()
  const complete = useCompletePack()
  const generateLabel = useGenerateLabel()
  const printLabel = usePrintLabel()
  const toast = useToastStore((s) => s.push)
  const workerId = useAuthStore((s) => s.user?.workerId) ?? 'w-pack-1'

  const stations = stationsQ.data ?? []
  const idleStations = useMemo(() => stations.filter((s) => s.status === 'IDLE'), [stations])

  const [assignStationByOrder, setAssignStationByOrder] = useState<Record<string, string>>({})
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)

  const packingOrders = packingQ.data ?? []
  const pickedCandidates = pickedQ.data ?? []

  const sessionOrderId =
    activeOrderId ??
    stations.find((s) => s.status === 'BUSY' && s.activeOrderId)?.activeOrderId ??
    packingOrders[0]?.id ??
    null

  const recommendQ = useRecommendPackage(sessionOrderId)
  const [pkg, setPkg] = useState('Carton M')
  const [weight, setWeight] = useState('1.1')
  const [l, setL] = useState('32')
  const [w, setW] = useState('22')
  const [h, setH] = useState('14')

  const stationName = (stationId: string | null) =>
    stations.find((s) => s.id === stationId)?.name ?? stationId ?? '—'

  const handlePrintLabel = async (orderId: string) => {
    try {
      let label = (labelsQ.data ?? []).find((lbl) => lbl.orderId === orderId)
      if (!label) {
        label = await generateLabel.mutateAsync({ orderId, courier: 'UPBOX' })
      }
      await printLabel.mutateAsync(label.id)
      toast(`Label printed · ${label.trackingNumber}`)
      window.print()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Packing stations' }]} />
      <PageHeader
        title="Packing stations"
        description="Assign picked orders to idle stations, validate dimensions, and print shipping labels."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stations.map((s) => (
          <div key={s.id} className="surface-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base">{s.name}</h3>
              <StatusBadge label={s.status} tone={s.status === 'BUSY' ? 'violet' : s.status === 'IDLE' ? 'green' : 'slate'} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{s.zone}</p>
            <p className="mt-3 text-sm">Active: {s.activeOrderId ?? '—'}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="font-heading text-base">Assign station</h2>
          <p className="mt-1 text-xs text-slate-500">Only picked orders awaiting a pack station.</p>
          <ul className="mt-3 space-y-2">
            {pickedCandidates.map((o) => (
              <li key={o.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-slate-500">{o.lines.length} lines</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={assignStationByOrder[o.id] ?? ''}
                      onChange={(e) =>
                        setAssignStationByOrder((prev) => ({ ...prev, [o.id]: e.target.value }))
                      }
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                    >
                      <option value="">Select idle station…</option>
                      {idleStations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      disabled={!assignStationByOrder[o.id] || start.isPending}
                      onClick={async () => {
                        const stationId = assignStationByOrder[o.id]
                        if (!stationId) {
                          toast('Select an idle station first', 'error')
                          return
                        }
                        try {
                          await start.mutateAsync({ stationId, orderId: o.id, operatorId: workerId })
                          const station = stations.find((s) => s.id === stationId)
                          toast(`Packing on ${station?.name ?? stationId}`)
                          setActiveOrderId(o.id)
                        } catch (e) {
                          toast((e as Error).message, 'error')
                        }
                      }}
                    >
                      Start pack
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!pickedCandidates.length ? (
              <p className="text-sm text-slate-500">No picked orders waiting for a station.</p>
            ) : null}
          </ul>

          <h3 className="mt-6 font-heading text-sm">Currently packing</h3>
          <ul className="mt-2 space-y-2">
            {packingOrders.map((o) => (
              <li
                key={o.id}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                  sessionOrderId === o.id ? 'border-primary-300 bg-primary-50/50' : 'border-slate-200'
                }`}
              >
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">
                    Locked to <span className="font-semibold">{stationName(o.packStationId)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold"
                  onClick={() => setActiveOrderId(o.id)}
                >
                  Work on
                </button>
              </li>
            ))}
            {!packingOrders.length ? (
              <p className="text-sm text-slate-500">No orders currently packing.</p>
            ) : null}
          </ul>
        </section>

        <section className="surface-card p-5">
          <h2 className="font-heading text-base">Package & QC</h2>
          {!sessionOrderId ? (
            <p className="mt-3 text-sm text-slate-500">Assign or select a packing order to continue.</p>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-500">
                Order {packingOrders.find((o) => o.id === sessionOrderId)?.orderNumber ?? sessionOrderId}
              </p>
              <ul className="mt-3 space-y-2">
                {(recommendQ.data ?? []).slice(0, 4).map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setPkg(p.name)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                        pkg === p.name ? 'border-primary-400 bg-primary-50' : 'border-slate-200'
                      }`}
                    >
                      <span>
                        <span className="font-semibold">{p.name}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {p.type} · max {p.maxWeightKg}kg
                        </span>
                      </span>
                      <StatusBadge label={i === 0 ? 'Best' : `Score ${p.score}`} tone={i === 0 ? 'green' : 'slate'} />
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 font-heading text-sm">Weight & dimension validation</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="text-xs">
                  Weight kg
                  <input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5" />
                </label>
                <label className="text-xs">
                  Package
                  <input value={pkg} onChange={(e) => setPkg(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5" />
                </label>
                <label className="text-xs">
                  L cm
                  <input value={l} onChange={(e) => setL(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5" />
                </label>
                <label className="text-xs">
                  W cm
                  <input value={w} onChange={(e) => setW(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5" />
                </label>
                <label className="text-xs">
                  H cm
                  <input value={h} onChange={(e) => setH(e.target.value)} className="mt-1 w-full rounded-lg border px-2 py-1.5" />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={async () => {
                    try {
                      const res = await validate.mutateAsync({
                        orderId: sessionOrderId,
                        packageType: pkg,
                        weightKg: Number(weight),
                        lengthCm: Number(l),
                        widthCm: Number(w),
                        heightCm: Number(h),
                      })
                      toast(
                        res.weightOk && res.dimsOk ? 'Validation passed' : 'Validation failed',
                        res.weightOk && res.dimsOk ? 'success' : 'error'
                      )
                    } catch (e) {
                      toast((e as Error).message, 'error')
                    }
                  }}
                >
                  Validate
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
                  onClick={async () => {
                    try {
                      await complete.mutateAsync(sessionOrderId)
                      toast('QC passed — ready for route bag')
                      setActiveOrderId(null)
                    } catch (e) {
                      toast((e as Error).message, 'error')
                    }
                  }}
                >
                  Complete QC & pack
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
                  onClick={() => void handlePrintLabel(sessionOrderId)}
                >
                  Print shipping label
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
