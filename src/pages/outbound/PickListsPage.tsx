import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import {
  useAssignPicker,
  useAutoAssignQueuedLists,
  usePickAssignConfig,
  usePickLists,
  useUpdatePickAssignConfig,
} from '@/hooks/useOutbound'
import type { PickAssignStrategy, PickList } from '@/types/outbound'
import { useToastStore } from '@/store/useToastStore'

const PICKERS = [
  { id: 'w-pick-1', name: 'Ravi Pick' },
  { id: 'w-pick-2', name: 'Priya Pick' },
]

const STRATEGY_LABELS: Record<PickAssignStrategy, string> = {
  least_open_lists: 'Least open lists',
  round_robin: 'Round robin',
  zone_match: 'Zone match',
}

export function PickListsPage() {
  const q = usePickLists()
  const configQ = usePickAssignConfig()
  const updateConfig = useUpdatePickAssignConfig()
  const autoAssign = useAutoAssignQueuedLists()
  const assign = useAssignPicker()
  const toast = useToastStore((s) => s.push)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const config = configQ.data

  const columns: DataColumn<PickList>[] = [
    { id: 'id', header: 'Pick list', sortValue: (r) => r.id, accessor: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { id: 'wave', header: 'Wave', accessor: (r) => r.waveId },
    {
      id: 'picker',
      header: 'Picker',
      accessor: (r) => r.pickerName ?? <span className="text-slate-400">Unassigned</span>,
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      accessor: (r) => <StatusBadge label={r.status} tone={r.status === 'COMPLETE' ? 'green' : 'blue'} />,
    },
    {
      id: 'stops',
      header: 'Stops',
      sortValue: (r) => r.stops.length,
      accessor: (r) => `${r.stops.filter((s) => s.done).length}/${r.stops.length}`,
    },
    {
      id: 'route',
      header: 'Route',
      accessor: (r) => (r.routeOptimized ? <StatusBadge label="Optimized" tone="green" /> : <StatusBadge label="Raw" tone="amber" />),
    },
    {
      id: 'assign',
      header: 'Assign',
      accessor: (r) => (
        <select
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
          defaultValue=""
          onChange={async (e) => {
            const p = PICKERS.find((x) => x.id === e.target.value)
            if (!p) return
            try {
              await assign.mutateAsync({ pickListId: r.id, pickerId: p.id, pickerName: p.name })
              toast(`Assigned ${p.name}`)
            } catch (err) {
              toast((err as Error).message, 'error')
            }
          }}
        >
          <option value="">Assign…</option>
          {PICKERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Pick lists' }]} />
      <PageHeader
        title="Pick lists"
        description="Pick queue, picker assignment, route-optimized stop sequences, and auto-assign settings."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              {settingsOpen ? 'Hide settings' : 'Assign settings'}
            </button>
            <button
              type="button"
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={autoAssign.isPending}
              onClick={async () => {
                try {
                  await autoAssign.mutateAsync()
                  toast('Queued lists auto-assigned', 'success')
                } catch (e) {
                  toast((e as Error).message, 'error')
                }
              }}
            >
              Auto-assign queued
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
              onClick={() => window.print()}
            >
              Print view
            </button>
          </div>
        }
      />

      {settingsOpen && config ? (
        <section className="surface-card mb-6 p-5">
          <h2 className="font-heading text-base">Pick assign configuration</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.autoAssignEnabled}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ autoAssignEnabled: e.target.checked })
                    toast('Settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
              />
              Auto-assign enabled
            </label>
            <label className="text-sm">
              Strategy
              <select
                value={config.strategy}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ strategy: e.target.value as PickAssignStrategy })
                    toast('Settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              >
                {Object.entries(STRATEGY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Max open lists per picker
              <input
                type="number"
                min={1}
                max={10}
                value={config.maxOpenListsPerPicker}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ maxOpenListsPerPicker: Number(e.target.value) })
                    toast('Settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.preferSameZone}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ preferSameZone: e.target.checked })
                    toast('Settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
              />
              Prefer same zone
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.splitByZone}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ splitByZone: e.target.checked })
                    toast('Settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
              />
              Split by zone
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.fallbackToQueue}
                onChange={async (e) => {
                  try {
                    await updateConfig.mutateAsync({ fallbackToQueue: e.target.checked })
                    toast('Settings saved')
                  } catch (err) {
                    toast((err as Error).message, 'error')
                  }
                }}
              />
              Fallback to queue
            </label>
          </div>
        </section>
      ) : null}

      <DataTable rows={q.data ?? []} columns={columns} loading={q.isLoading} searchPlaceholder="Search pick lists…" />

      <div className="mt-6 grid gap-4 lg:grid-cols-2 print:grid-cols-1">
        {(q.data ?? [])
          .filter((p) => p.stops.length)
          .slice(0, 2)
          .map((pl) => (
            <section key={pl.id} className="surface-card p-4">
              <h3 className="font-heading text-sm">
                Printable · {pl.id} {pl.pickerName ? `· ${pl.pickerName}` : ''}
              </h3>
              <ol className="mt-3 space-y-2">
                {pl.stops.map((s) => (
                  <li key={s.id} className="flex gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-mono text-xs text-primary-700">{s.sequence}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{s.locationCode}</p>
                      <p className="text-xs text-slate-500">
                        {s.sku} · {s.name} ×{s.qty} · Rack {s.rack} / Shelf {s.shelf} / Bin {s.bin}
                      </p>
                    </div>
                    <StatusBadge label={s.done ? 'Done' : 'Open'} tone={s.done ? 'green' : 'slate'} />
                  </li>
                ))}
              </ol>
            </section>
          ))}
      </div>
    </div>
  )
}
