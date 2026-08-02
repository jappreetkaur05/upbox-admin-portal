import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { RackBinsDetailPanel } from '@/components/warehouse/RackBinsDetailPanel'
import { WarehouseScopeBar } from '@/components/warehouse/WarehouseScopeBar'
import {
  useWarehouseAisles,
  useWarehouseRacks,
  useWarehouseZones,
} from '@/hooks/useWarehouseAdmin'
import { useWarehouseScope } from '@/hooks/useWarehouseScope'
import { useInventoryLocations } from '@/hooks/useInventory'
import { warehouseAdminService } from '@/services/warehouseAdmin.service'
import { rackKeyFromCode } from '@/lib/warehouseMap'
import { cn } from '@/lib/cn'

function rackStatusClass(s: string) {
  if (s === 'full') return 'bg-rose-50 text-rose-800 ring-rose-200'
  if (s === 'empty') return 'bg-slate-100 text-slate-600 ring-slate-200'
  return 'bg-sky-50 text-sky-900 ring-sky-200'
}

export function WarehouseRacksPage() {
  const [params, setParams] = useSearchParams()
  const { warehouseId, warehouse } = useWarehouseScope()
  const zoneId = params.get('zone') ?? ''
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null)

  const zonesQ = useWarehouseZones(warehouseId)
  const aislesQ = useWarehouseAisles(warehouseId)
  const racksQ = useWarehouseRacks(warehouseId)
  const locsQ = useInventoryLocations('')

  const aisleLabel = (id: string) => aislesQ.data?.find((a) => a.id === id)?.label ?? id

  const rows = useMemo(() => {
    let list = racksQ.data ?? []
    if (zoneId) list = list.filter((r) => r.zoneId === zoneId)
    return list
  }, [racksQ.data, zoneId])

  const selected = rows.find((r) => r.id === selectedRackId) ?? null

  const rackBins = useMemo(() => {
    if (!selected || !locsQ.data) return []
    return locsQ.data
      .filter((loc) => rackKeyFromCode(loc.locationCode) === selected.code)
      .sort((a, b) => a.locationCode.localeCompare(b.locationCode))
  }, [selected, locsQ.data])

  return (
    <div>
      <PageHeader
        title="Racks"
        description={`Racks and bins for ${warehouse?.name ?? 'selected warehouse'} — click a rack for bin and product details.`}
      />

      <WarehouseScopeBar
        extra={
          <label className="block text-xs font-semibold text-slate-600">
            Zone
            <select
              className="surface-input mt-1 cursor-pointer px-3 py-2 text-sm"
              value={zoneId}
              onChange={(e) => {
                const next = new URLSearchParams(params)
                if (e.target.value) next.set('zone', e.target.value)
                else next.delete('zone')
                setParams(next)
                setSelectedRackId(null)
              }}
            >
              <option value="">All zones</option>
              {(zonesQ.data ?? []).map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>
        }
      />

      {racksQ.isLoading || locsQ.isLoading ? <LoadingPanel label="Loading racks…" /> : null}

      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-[1fr_420px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Aisle</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3">Bays / Shelves</th>
                  <th className="px-4 py-3">Fill</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRackId(selectedRackId === r.id ? null : r.id)}
                    className={cn(
                      'cursor-pointer hover:bg-sky-50/50',
                      selected?.id === r.id && 'bg-sky-50'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{r.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.label}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{aisleLabel(r.aisleId)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {warehouseAdminService.zoneName(r.zoneId)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {r.bayCount} / {r.shelfCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${r.fillPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{r.fillPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.brandName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'rounded-lg px-2 py-1 text-xs font-bold capitalize ring-1',
                          rackStatusClass(r.status)
                        )}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !racksQ.isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                      No racks for this warehouse.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <RackBinsDetailPanel
            rack={selected}
            bins={rackBins}
            onClose={() => setSelectedRackId(null)}
          />
        ) : null}
      </div>
    </div>
  )
}
