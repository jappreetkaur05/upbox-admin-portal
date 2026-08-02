import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useWarehouses, useWarehouseZones } from '@/hooks/useWarehouseAdmin'
import type { WarehouseStatus } from '@/types/warehouseAdmin'
import { cn } from '@/lib/cn'

function statusLabel(s: WarehouseStatus) {
  if (s === 'active') return 'Active'
  if (s === 'maintenance') return 'Maintenance'
  return 'Inactive'
}

function statusClass(s: WarehouseStatus) {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  if (s === 'maintenance') return 'bg-amber-50 text-amber-900 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

export function WarehouseListPage() {
  const whQ = useWarehouses()
  const zonesQ = useWarehouseZones()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<WarehouseStatus | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(() => {
    let list = whQ.data ?? []
    const needle = q.trim().toLowerCase()
    if (status) list = list.filter((w) => w.status === status)
    if (needle) {
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(needle) ||
          w.code.toLowerCase().includes(needle) ||
          w.city.toLowerCase().includes(needle)
      )
    }
    return list
  }, [whQ.data, q, status])

  const selected = rows.find((w) => w.id === selectedId) ?? rows[0]
  const zoneCount = (id: string) => (zonesQ.data ?? []).filter((z) => z.warehouseId === id).length

  return (
    <div>
      <PageHeader
        title="Warehouse List"
        description="All warehouses and their operational details."
        actions={
          <Link
            to="/warehouse/create"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Create warehouse
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="surface-input min-w-[200px] flex-1 px-3 py-2 text-sm"
          placeholder="Search name, code, city…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as WarehouseStatus | '')}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {whQ.isLoading ? <LoadingPanel label="Loading warehouses…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Zones</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((w) => (
                  <tr
                    key={w.id}
                    className={cn(
                      'cursor-pointer hover:bg-sky-50/50',
                      selected?.id === w.id && 'bg-sky-50'
                    )}
                    onClick={() => setSelectedId(w.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{w.name}</div>
                      <div className="font-mono text-xs text-slate-500">{w.code}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{w.city}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-lg px-2 py-1 text-xs font-bold ring-1',
                          statusClass(w.status)
                        )}
                      >
                        {statusLabel(w.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{zoneCount(w.id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-sky-500"
                            style={{ width: `${w.capacityPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{w.capacityPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(w.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Details</p>
            <h2 className="mt-1 font-heading text-lg text-slate-900">{selected.name}</h2>
            <p className="mt-1 font-mono text-xs text-slate-500">{selected.code}</p>
            <p className="mt-3 text-sm text-slate-600">
              {selected.address}, {selected.city}
            </p>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Hours</dt>
                <dd className="font-semibold text-slate-800">{selected.operatingHours}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Timezone</dt>
                <dd className="font-semibold text-slate-800">{selected.timezone}</dd>
              </div>
              {selected.notes ? (
                <div>
                  <dt className="text-slate-500">Notes</dt>
                  <dd className="mt-0.5 text-slate-700">{selected.notes}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to={`/warehouse/zones?warehouse=${selected.id}`}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Zones
              </Link>
              <Link
                to={`/warehouse/aisles?warehouse=${selected.id}`}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Aisles
              </Link>
              <Link
                to={`/warehouse/racks?warehouse=${selected.id}`}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Racks / Bins
              </Link>
              <Link
                to={`/warehouse/mapping?warehouse=${selected.id}`}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-sky-800 hover:bg-sky-50"
              >
                Mapping
              </Link>
              <Link
                to={`/warehouse/status?warehouse=${selected.id}`}
                className="cursor-pointer rounded-lg bg-sky-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-sky-700"
              >
                Status
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
