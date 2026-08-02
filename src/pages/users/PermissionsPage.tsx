import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { usePermissionsMatrix, useTogglePermission } from '@/hooks/useUsersAdmin'
import { roleJobLabel } from '@/lib/shifts'
import type { PermissionModule } from '@/data/mockUsersAdmin'
import type { WorkerRole } from '@/types/inbound'
import { cn } from '@/lib/cn'

const ROLES: WorkerRole[] = [
  'DOCK_RECEIVER',
  'UNPACKER',
  'PUTAWAY',
  'PICKER',
  'PACKER',
  'DOCK_DISPATCHER',
  'WMS_SUPERVISOR',
]

const MODULES: Array<PermissionModule | 'All'> = ['All', 'Inbound', 'Outbound', 'Inventory', 'Admin']

export function PermissionsPage() {
  const permsQ = usePermissionsMatrix()
  const toggle = useTogglePermission()
  const [module, setModule] = useState<(typeof MODULES)[number]>('All')
  const [roleFilter, setRoleFilter] = useState<WorkerRole | ''>('')

  const defs = useMemo(() => {
    const all = permsQ.data?.defs ?? []
    if (module === 'All') return all
    return all.filter((d) => d.module === module)
  }, [permsQ.data, module])

  const roles = roleFilter ? [roleFilter] : ROLES
  const matrix = permsQ.data?.matrix

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="What each role is allowed to do. Toggles are mock and last for this session."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {MODULES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModule(m)}
            className={cn(
              'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition',
              module === m
                ? 'bg-sky-600 text-white ring-sky-600'
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
            )}
          >
            {m}
          </button>
        ))}
        <select
          className="surface-input ml-auto cursor-pointer px-3 py-1.5 text-xs font-semibold"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as WorkerRole | '')}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleJobLabel(r)}
            </option>
          ))}
        </select>
      </div>

      {permsQ.isLoading ? <LoadingPanel label="Loading permissions…" /> : null}

      {matrix ? (
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3">Capability</th>
                  {roles.map((r) => (
                    <th key={r} className="px-3 py-3 text-center">
                      {roleJobLabel(r)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defs.map((def) => (
                  <tr key={def.id} className="hover:bg-slate-50/60">
                    <td className="sticky left-0 bg-white px-4 py-2.5">
                      <div className="font-medium text-slate-800">{def.label}</div>
                      <div className="text-[10px] font-semibold uppercase text-slate-400">{def.module}</div>
                    </td>
                    {roles.map((role) => {
                      const on = (matrix[role] ?? []).includes(def.id)
                      return (
                        <td key={role} className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-sky-600"
                            checked={on}
                            disabled={toggle.isPending}
                            onChange={() =>
                              toggle.mutate({ role, permId: def.id, enabled: !on })
                            }
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
