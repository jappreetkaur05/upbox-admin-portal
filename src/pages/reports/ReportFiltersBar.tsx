import type { DateRangePreset } from '@/types/reportsAdmin'
import { REPORT_WAREHOUSES } from '@/types/reportsAdmin'

export type ReportFiltersValue = {
  dateRange: DateRangePreset
  warehouse: string
  brand?: string
  sku?: string
}

type Props = {
  value: ReportFiltersValue
  onChange: (next: ReportFiltersValue) => void
  showBrand?: boolean
  showSku?: boolean
}

const DATE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
]

export function ReportFiltersBar({ value, onChange, showBrand, showSku }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
      <label className="text-xs font-semibold text-slate-600">
        Date range
        <select
          className="surface-input mt-1 block min-w-[140px]"
          value={value.dateRange}
          onChange={(e) =>
            onChange({ ...value, dateRange: e.target.value as DateRangePreset })
          }
        >
          {DATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-600">
        Warehouse
        <select
          className="surface-input mt-1 block min-w-[140px]"
          value={value.warehouse}
          onChange={(e) => onChange({ ...value, warehouse: e.target.value })}
        >
          {REPORT_WAREHOUSES.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </label>
      {showBrand ? (
        <label className="text-xs font-semibold text-slate-600">
          Brand
          <input
            className="surface-input mt-1 block min-w-[120px]"
            value={value.brand ?? ''}
            placeholder="All brands"
            onChange={(e) => onChange({ ...value, brand: e.target.value })}
          />
        </label>
      ) : null}
      {showSku ? (
        <label className="text-xs font-semibold text-slate-600">
          SKU
          <input
            className="surface-input mt-1 block min-w-[120px]"
            value={value.sku ?? ''}
            placeholder="Search SKU"
            onChange={(e) => onChange({ ...value, sku: e.target.value })}
          />
        </label>
      ) : null}
    </div>
  )
}
