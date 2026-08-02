import { Link } from 'react-router-dom'
import { AlertTriangle, Boxes, Map, Percent, Warehouse } from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { WarehouseScopeBar } from '@/components/warehouse/WarehouseScopeBar'
import { useMoves } from '@/hooks/useInbound'
import { useWarehouseRacks, useWarehouseZones } from '@/hooks/useWarehouseAdmin'
import { useWarehouseScope } from '@/hooks/useWarehouseScope'
import {
  ZONE_PURPOSE_COLORS,
  ZONE_PURPOSE_LABELS,
  type WarehouseStatus,
} from '@/types/warehouseAdmin'
import { cn } from '@/lib/cn'

function healthFrom(capacity: number, status: WarehouseStatus, inactiveZones: number) {
  if (status === 'maintenance' || capacity >= 90 || inactiveZones >= 2) {
    return { label: 'Critical', cls: 'bg-rose-50 text-rose-900 ring-rose-200' }
  }
  if (status !== 'active' || capacity >= 80 || inactiveZones >= 1) {
    return { label: 'Attention', cls: 'bg-amber-50 text-amber-950 ring-amber-200' }
  }
  return { label: 'Healthy', cls: 'bg-emerald-50 text-emerald-900 ring-emerald-200' }
}

export function WarehouseStatusPage() {
  const { warehouseId, warehouse, withWarehouse, isLoading } = useWarehouseScope()
  const zonesQ = useWarehouseZones(warehouseId)
  const racksQ = useWarehouseRacks(warehouseId)
  const movesQ = useMoves({ search: '' })

  const zones = zonesQ.data ?? []
  const racks = racksQ.data ?? []
  const inactiveZones = zones.filter((z) => z.status === 'inactive').length
  const nearFull = racks.filter((r) => r.fillPercent >= 85).length
  const openMoves = (movesQ.data ?? []).filter((m) => m.state !== 'Complete').length
  const health = warehouse
    ? healthFrom(warehouse.capacityPercent, warehouse.status, inactiveZones)
    : { label: '—', cls: 'bg-slate-100 text-slate-600 ring-slate-200' }

  return (
    <div>
      <PageHeader
        title="Warehouse Status"
        description={`Operational health for ${warehouse?.name ?? 'selected warehouse'}.`}
      />

      <WarehouseScopeBar />

      {isLoading || zonesQ.isLoading ? <LoadingPanel label="Loading status…" /> : null}

      {warehouse ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="surface-panel p-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Overall</p>
              <span
                className={cn(
                  'mt-2 inline-flex rounded-lg px-2.5 py-1 text-sm font-bold ring-1',
                  health.cls
                )}
              >
                {health.label}
              </span>
              <p className="mt-2 text-xs text-slate-500">{warehouse.name}</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Capacity</p>
              <p className="mt-1 font-heading text-3xl text-slate-900">{warehouse.capacityPercent}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${warehouse.capacityPercent}%` }}
                />
              </div>
            </div>
            <div className="surface-panel p-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Open moves</p>
              <p className="mt-1 font-heading text-3xl text-slate-900">{openMoves}</p>
              <p className="mt-1 text-xs text-slate-500">Stock transfers in progress</p>
            </div>
            <div className="surface-panel p-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Near-full racks</p>
              <p className="mt-1 font-heading text-3xl text-slate-900">{nearFull}</p>
              <p className="mt-1 text-xs text-slate-500">≥ 85% fill</p>
            </div>
          </div>

          {(inactiveZones > 0 || nearFull > 0 || warehouse.status === 'maintenance') && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-950">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-bold">Alerts</p>
              </div>
              <ul className="space-y-1 text-sm text-amber-950">
                {warehouse.status === 'maintenance' ? (
                  <li>Warehouse marked under maintenance</li>
                ) : null}
                {inactiveZones > 0 ? <li>{inactiveZones} zone(s) inactive</li> : null}
                {nearFull > 0 ? <li>{nearFull} rack(s) near or at capacity</li> : null}
              </ul>
            </div>
          )}

          <h2 className="mb-3 font-heading text-base text-slate-900">Zone work</h2>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z) => (
              <div key={z.id} className="surface-panel p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{z.name}</h3>
                  <span
                    className={cn(
                      'rounded-lg px-2 py-0.5 text-[10px] font-bold ring-1',
                      ZONE_PURPOSE_COLORS[z.purpose]
                    )}
                  >
                    {ZONE_PURPOSE_LABELS[z.purpose]}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{z.workDescription}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{z.capacityPercent}% capacity</span>
                  <span
                    className={cn(
                      'font-bold capitalize',
                      z.status === 'active' ? 'text-emerald-700' : 'text-slate-400'
                    )}
                  >
                    {z.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={withWarehouse('/inventory/utilization')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Percent className="h-3.5 w-3.5" /> Storage capacity
            </Link>
            <Link
              to={withWarehouse('/warehouse/mapping')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Map className="h-3.5 w-3.5" /> Mapping
            </Link>
            <Link
              to={withWarehouse('/warehouse/racks')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Boxes className="h-3.5 w-3.5" /> Racks
            </Link>
            <Link
              to={withWarehouse('/warehouse/zones')}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Warehouse className="h-3.5 w-3.5" /> Zones
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}
