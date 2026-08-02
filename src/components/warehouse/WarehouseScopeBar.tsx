import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useWarehouseScope } from '@/hooks/useWarehouseScope'
import { cn } from '@/lib/cn'

const SECTIONS = [
  { to: '/warehouse/zones', label: 'Zones' },
  { to: '/warehouse/aisles', label: 'Aisles' },
  { to: '/warehouse/racks', label: 'Racks / Bins' },
  { to: '/inventory/utilization', label: 'Capacity' },
  { to: '/warehouse/mapping', label: 'Mapping' },
  { to: '/warehouse/status', label: 'Status' },
] as const

export function WarehouseScopeBar({ extra }: { extra?: ReactNode }) {
  const { warehouseId, warehouses, setWarehouseId, withWarehouse, warehouse } =
    useWarehouseScope()

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-[220px] flex-1 text-xs font-semibold text-slate-600 sm:max-w-xs sm:flex-none">
          Warehouse
          <select
            className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm font-medium text-slate-900"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
                {w.isPrimary ? ' (primary)' : ''}
                {w.city ? ` · ${w.city}` : ''}
              </option>
            ))}
          </select>
        </label>
        {warehouse ? (
          <p className="pb-2 text-xs text-slate-500">
            <span className="font-mono font-semibold text-slate-700">{warehouse.code}</span>
            {' · '}
            {warehouse.city}
            {' · '}
            <span className="capitalize">{warehouse.status}</span>
          </p>
        ) : null}
        {extra}
      </div>

      <nav className="flex flex-wrap gap-1.5" aria-label="Warehouse sections">
        {SECTIONS.map((s) => (
          <NavLink
            key={s.to}
            to={withWarehouse(s.to)}
            className={({ isActive }) =>
              cn(
                'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition',
                isActive
                  ? 'bg-sky-600 text-white ring-sky-600'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-sky-50 hover:text-sky-800'
              )
            }
          >
            {s.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
