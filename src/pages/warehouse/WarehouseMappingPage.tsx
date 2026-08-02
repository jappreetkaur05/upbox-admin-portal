import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { WarehouseScopeBar } from '@/components/warehouse/WarehouseScopeBar'
import { LocationsBrowserPage } from '@/pages/inventory/LocationsBrowserPage'
import { useWarehouseZones } from '@/hooks/useWarehouseAdmin'
import { useWarehouseScope } from '@/hooks/useWarehouseScope'
import { warehouseAdminService } from '@/services/warehouseAdmin.service'
import { ZONE_PURPOSE_COLORS, ZONE_PURPOSE_LABELS } from '@/types/warehouseAdmin'
import { cn } from '@/lib/cn'

export function WarehouseMappingPage() {
  const { warehouseId, warehouse, withWarehouse } = useWarehouseScope()
  const zonesQ = useWarehouseZones(warehouseId)
  const primary = warehouseAdminService.primaryWarehouseId()
  const isPrimary = warehouse?.isPrimary || warehouseId === primary

  return (
    <div>
      <PageHeader
        title="Warehouse Mapping"
        description={`Floor map for ${warehouse?.name ?? 'selected warehouse'} — rack drill-in with purpose-colored zones.`}
        actions={
          <Link
            to={withWarehouse('/warehouse/racks')}
            className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Racks / Bins
          </Link>
        }
      />

      <WarehouseScopeBar
        extra={
          <div className="flex flex-wrap gap-1.5 pb-2">
            {(zonesQ.data ?? []).map((z) => (
              <span
                key={z.id}
                className={cn(
                  'rounded-lg px-2 py-1 text-[10px] font-bold ring-1',
                  ZONE_PURPOSE_COLORS[z.purpose]
                )}
                title={z.workDescription}
              >
                {ZONE_PURPOSE_LABELS[z.purpose]}
              </span>
            ))}
          </div>
        }
      />

      {!isPrimary ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Floor map geometry is linked to the primary warehouse (
          {warehouseAdminService.warehouseName(primary)}). Showing that map with{' '}
          <span className="font-semibold">{warehouse?.name}</span> zone legend above. Full layouts for
          secondary warehouses can be added later.
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
        <LocationsBrowserPage embedded mappingTitle={warehouse?.name} />
      </div>
    </div>
  )
}
