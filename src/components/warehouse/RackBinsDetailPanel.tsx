import { useState } from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { brands } from '@/data/mockInventory'
import { cn } from '@/lib/cn'
import type { InventoryLocation } from '@/types/inventory'
import type { WarehouseRackRecord } from '@/types/warehouseAdmin'
import { warehouseAdminService } from '@/services/warehouseAdmin.service'

export function RackBinsDetailPanel({
  rack,
  bins,
  onClose,
}: {
  rack: WarehouseRackRecord
  bins: InventoryLocation[]
  onClose: () => void
}) {
  const [openBinId, setOpenBinId] = useState<string | null>(null)
  const productBins = bins.filter((b) => b.lineItems.length > 0).length
  const totalUnits = bins.reduce((s, b) => s + b.filledUnits, 0)

  return (
    <aside className="surface-panel flex max-h-[calc(100vh-8rem)] w-full flex-col overflow-hidden lg:w-[420px]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Rack bins</p>
          <h2 className="font-heading text-lg text-slate-900">{rack.label}</h2>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{rack.code}</p>
          <p className="mt-1 text-xs text-slate-600">
            {warehouseAdminService.zoneName(rack.zoneId)} · {rack.fillPercent}% fill
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">{bins.length}</span> bins ·{' '}
        <span className="font-semibold text-slate-800">{productBins}</span> with stock ·{' '}
        <span className="font-semibold text-slate-800">{totalUnits}</span> units
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {bins.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            No bins found for this rack.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {bins.map((bin) => {
              const open = openBinId === bin.id
              const skuCount = new Set(bin.lineItems.map((li) => li.sku)).size
              return (
                <div key={bin.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left hover:bg-sky-50/50',
                      open && 'bg-sky-50'
                    )}
                    onClick={() => setOpenBinId(open ? null : bin.id)}
                  >
                    {open ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {bin.locationCode}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {bin.filledUnits}/{bin.maxUnits} units · {skuCount} SKU
                        {skuCount === 1 ? '' : 's'} · {bin.fillPercent}%
                      </p>
                    </div>
                    {bin.lineItems.length > 0 ? (
                      <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                        Stock
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                        Empty
                      </span>
                    )}
                  </button>

                  {open ? (
                    <div className="bg-slate-50/80 px-4 pb-4 pt-1">
                      {bin.lineItems.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs text-slate-500">
                          No products on this bin.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              <tr>
                                <th className="px-3 py-2">Product</th>
                                <th className="px-3 py-2">SKU</th>
                                <th className="px-3 py-2">Qty</th>
                                <th className="px-3 py-2">Batch</th>
                                <th className="px-3 py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bin.lineItems.map((li) => (
                                <tr key={li.id}>
                                  <td className="px-3 py-2.5">
                                    <p className="font-semibold text-slate-900">{li.name}</p>
                                    <p className="font-mono text-[10px] text-slate-400">
                                      {li.barcode}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {brands.find((b) => b.id === li.brandId)?.name ?? '—'}
                                    </p>
                                  </td>
                                  <td className="px-3 py-2.5 font-mono text-xs text-sky-700">
                                    {li.sku}
                                  </td>
                                  <td className="px-3 py-2.5 font-semibold">{li.quantity}</td>
                                  <td className="px-3 py-2.5 font-mono text-xs text-slate-600">
                                    {li.batchNo ?? '—'}
                                  </td>
                                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-600">
                                    {li.status}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
