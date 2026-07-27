import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { useCreateWave, useOutboundOrders, useReleaseWave, useWaves } from '@/hooks/useOutbound'
import type { Wave, WaveType } from '@/types/outbound'
import { useToastStore } from '@/store/useToastStore'

export function WavePlanningPage() {
  const wavesQ = useWaves()
  const allocQ = useOutboundOrders({ status: 'ALLOCATED' })
  const createWave = useCreateWave()
  const release = useReleaseWave()
  const toast = useToastStore((s) => s.push)
  const [name, setName] = useState('WAVE-' + new Date().getHours())
  const [type, setType] = useState<WaveType>('batch')
  const [zone, setZone] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const columns: DataColumn<Wave>[] = [
    { id: 'name', header: 'Wave', sortValue: (r) => r.name, accessor: (r) => <span className="font-semibold">{r.name}</span> },
    { id: 'type', header: 'Type', sortValue: (r) => r.type, accessor: (r) => <StatusBadge label={r.type} tone="blue" /> },
    { id: 'status', header: 'Status', sortValue: (r) => r.status, accessor: (r) => <StatusBadge label={r.status} tone={r.status === 'COMPLETE' ? 'green' : 'violet'} /> },
    { id: 'orders', header: 'Orders', sortValue: (r) => r.orderIds.length, accessor: (r) => r.orderIds.length },
    { id: 'zone', header: 'Zone', accessor: (r) => r.zoneFilter ?? '—' },
    {
      id: 'actions',
      header: '',
      accessor: (r) =>
        r.status === 'DRAFT' || r.status === 'RELEASED' ? (
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
            onClick={async () => {
              try {
                await release.mutateAsync(r.id)
                toast(`Released ${r.name}`)
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Release
          </button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Wave planning' }]} />
      <PageHeader title="Wave planning" description="Create batch, zone, priority, and scheduled waves from allocated orders." />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card space-y-3 p-4 lg:col-span-1">
          <h2 className="font-heading text-sm">Create wave</h2>
          <label className="block text-xs font-medium text-slate-600">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Type
            <select value={type} onChange={(e) => setType(e.target.value as WaveType)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="batch">Batch picking</option>
              <option value="zone">Zone picking</option>
              <option value="priority">Priority</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Zone filter
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="e.g. A" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div>
            <p className="text-xs font-medium text-slate-600">Allocated orders</p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-auto">
              {(allocQ.data ?? []).map((o) => (
                <label key={o.id} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selected.includes(o.id)}
                    onChange={() => setSelected((s) => (s.includes(o.id) ? s.filter((x) => x !== o.id) : [...s, o.id]))}
                  />
                  {o.orderNumber}
                </label>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-primary-600 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              if (!selected.length) {
                toast('Select at least one order', 'error')
                return
              }
              try {
                await createWave.mutateAsync({
                  name,
                  type,
                  orderIds: selected,
                  zoneFilter: zone || null,
                  scheduledAt: type === 'scheduled' ? new Date(Date.now() + 3600_000).toISOString() : null,
                })
                toast('Wave created')
                setSelected([])
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Create wave
          </button>
        </div>
        <div className="lg:col-span-2">
          <DataTable rows={wavesQ.data ?? []} columns={columns} loading={wavesQ.isLoading} searchPlaceholder="Search waves…" />
        </div>
      </div>
    </div>
  )
}
