import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import {
  useCreateAndReleaseWave,
  useCreateWave,
  useOutboundOrders,
  usePickAssignConfig,
  usePickLists,
  useReleaseWave,
  useUpdatePickAssignConfig,
  useWaves,
} from '@/hooks/useOutbound'
import type { PickAssignStrategy, Wave, WaveType } from '@/types/outbound'
import { useToastStore } from '@/store/useToastStore'

const STRATEGY_LABELS: Record<PickAssignStrategy, string> = {
  least_open_lists: 'Least open lists',
  round_robin: 'Round robin',
  zone_match: 'Zone match',
}

export function WavePlanningPage() {
  const wavesQ = useWaves()
  const allocQ = useOutboundOrders({ status: 'ALLOCATED' })
  const listsQ = usePickLists()
  const createWave = useCreateWave()
  const createAndRelease = useCreateAndReleaseWave()
  const release = useReleaseWave()
  const configQ = usePickAssignConfig()
  const updateConfig = useUpdatePickAssignConfig()
  const toast = useToastStore((s) => s.push)

  const [name, setName] = useState('WAVE-' + new Date().getHours())
  const [type, setType] = useState<WaveType>('batch')
  const [zone, setZone] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [moreOpen, setMoreOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lastReleasedWaveId, setLastReleasedWaveId] = useState<string | null>(null)

  const allocated = allocQ.data ?? []
  const lastLists = useMemo(
    () => (listsQ.data ?? []).filter((p) => p.waveId === lastReleasedWaveId),
    [listsQ.data, lastReleasedWaveId]
  )

  const columns: DataColumn<Wave>[] = [
    { id: 'name', header: 'Wave', sortValue: (r) => r.name, accessor: (r) => <span className="font-semibold">{r.name}</span> },
    { id: 'type', header: 'Type', sortValue: (r) => r.type, accessor: (r) => <StatusBadge label={r.type} tone="blue" /> },
    {
      id: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      accessor: (r) => <StatusBadge label={r.status} tone={r.status === 'COMPLETE' ? 'green' : 'violet'} />,
    },
    { id: 'orders', header: 'Orders', sortValue: (r) => r.orderIds.length, accessor: (r) => r.orderIds.length },
    {
      id: 'actions',
      header: '',
      accessor: (r) =>
        r.status === 'DRAFT' ? (
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
            onClick={async () => {
              try {
                await release.mutateAsync(r.id)
                setLastReleasedWaveId(r.id)
                toast(`Released ${r.name} — go pick`)
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Release to pick
          </button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ]

  const payload = () => ({
    name,
    type,
    orderIds: selected,
    zoneFilter: zone || null,
    scheduledAt: type === 'scheduled' ? new Date(Date.now() + 3600_000).toISOString() : null,
  })

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Send to pick' }]} />
      <PageHeader
        title="Send allocated orders to picking"
        description="Select allocated orders, then release them to the floor as pick work."
        actions={
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            onClick={() => setSettingsOpen((v) => !v)}
          >
            Assignment settings
          </button>
        }
      />

      <OutboundChrome
        what="Batch allocated orders and send them to pickers."
        doNow={
          allocated.length
            ? `${allocated.length} allocated order(s) waiting — select and release.`
            : 'No allocated orders — finish Allocation first.'
        }
        nextLabel="Next: Picking"
        nextTo="/outbound/picking"
      >
        {settingsOpen ? (
          <section className="surface-card mb-5 space-y-3 p-4">
            <h2 className="font-heading text-sm">Picker assignment</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={configQ.data?.autoAssignEnabled ?? true}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ autoAssignEnabled: e.target.checked })
                    toast('Assignment settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
              />
              Auto-assign pickers when a wave is released
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Strategy
              <select
                className="mt-1 w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
                value={configQ.data?.strategy ?? 'least_open_lists'}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ strategy: e.target.value as PickAssignStrategy })
                    toast('Strategy updated')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
              >
                {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-slate-500">
              Full list tools remain at{' '}
              <Link className="font-semibold text-primary-700 underline" to="/outbound/pick-lists">
                /outbound/pick-lists
              </Link>{' '}
              (not in the main menu).
            </p>
          </section>
        ) : null}

        <div className="mb-6 grid gap-4 lg:grid-cols-3 lg:items-stretch">
          <div className="surface-card flex min-h-[28rem] flex-col space-y-3 p-4 lg:col-span-1">
            <h2 className="font-heading text-sm">1. Select orders</h2>
            <label className="block text-xs font-medium text-slate-600">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              className="text-left text-xs font-semibold text-primary-700"
              onClick={() => setMoreOpen((v) => !v)}
            >
              {moreOpen ? 'Hide' : 'More'} options
            </button>
            {moreOpen ? (
              <>
                <label className="block text-xs font-medium text-slate-600">
                  Type
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WaveType)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="batch">Batch picking</option>
                    <option value="zone">Zone picking</option>
                    <option value="priority">Priority</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-slate-600">
                  Zone filter
                  <input
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="e.g. A"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </>
            ) : null}
            <div className="flex min-h-0 flex-1 flex-col">
              <p className="text-xs font-medium text-slate-600">
                Allocated orders ({selected.length}/{allocated.length})
              </p>
              <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
                {allocated.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selected.includes(o.id)}
                      onChange={() =>
                        setSelected((s) => (s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id]))
                      }
                    />
                    {o.orderNumber}
                  </label>
                ))}
                {!allocated.length ? <p className="text-xs text-slate-500">None waiting.</p> : null}
              </ul>
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              disabled={!selected.length || createAndRelease.isPending}
              onClick={async () => {
                try {
                  const res = await createAndRelease.mutateAsync(payload())
                  setLastReleasedWaveId(res.wave.id)
                  setSelected([])
                  toast(`Released ${res.wave.name} · ${res.pickLists.length} pick list(s)`, 'success')
                } catch (e) {
                  toast((e as Error).message, 'error')
                }
              }}
            >
              Create & release to pick
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700"
              disabled={!selected.length || createWave.isPending}
              onClick={async () => {
                try {
                  await createWave.mutateAsync(payload())
                  setSelected([])
                  toast('Draft wave saved — release when ready')
                } catch (e) {
                  toast((e as Error).message, 'error')
                }
              }}
            >
              Save as draft only
            </button>
          </div>

          <div className="space-y-4 lg:col-span-2">
            {lastReleasedWaveId && lastLists.length ? (
              <section className="surface-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-heading text-sm">Lists from this wave</h2>
                  <Link
                    to="/outbound/picking"
                    className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Open in Picking
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {lastLists.map((pl) => (
                    <li key={pl.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <span className="font-mono text-xs">{pl.id}</span>
                      <span>{pl.pickerName ?? 'Unassigned'}</span>
                      <span className="text-xs text-slate-500">
                        {pl.stops.filter((s) => s.outcome !== 'open').length}/{pl.stops.length} stops
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <DataTable rows={wavesQ.data ?? []} columns={columns} loading={wavesQ.isLoading} searchPlaceholder="Search waves…" />
          </div>
        </div>
      </OutboundChrome>
    </div>
  )
}
