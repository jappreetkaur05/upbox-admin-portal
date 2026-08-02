import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { WarehouseScopeBar } from '@/components/warehouse/WarehouseScopeBar'
import { useWarehouseAisles, useWarehouseZones } from '@/hooks/useWarehouseAdmin'
import { useWarehouseScope } from '@/hooks/useWarehouseScope'
import { warehouseAdminService } from '@/services/warehouseAdmin.service'

export function WarehouseAislesPage() {
  const [params, setParams] = useSearchParams()
  const { warehouseId, warehouse } = useWarehouseScope()
  const zoneId = params.get('zone') ?? ''
  const zonesQ = useWarehouseZones(warehouseId)
  const aislesQ = useWarehouseAisles(warehouseId)

  const rows = useMemo(() => {
    let list = aislesQ.data ?? []
    if (zoneId) list = list.filter((a) => a.zoneId === zoneId)
    return list
  }, [aislesQ.data, zoneId])

  return (
    <div>
      <PageHeader
        title="Aisles"
        description={`Aisle catalog for ${warehouse?.name ?? 'selected warehouse'}.`}
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

      {aislesQ.isLoading ? <LoadingPanel label="Loading aisles…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Racks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800">{a.code}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{a.label}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {warehouseAdminService.zoneName(a.zoneId)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{a.rackCount}</td>
                </tr>
              ))}
              {rows.length === 0 && !aislesQ.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                    No aisles for this warehouse.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
