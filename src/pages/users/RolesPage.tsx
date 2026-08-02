import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useRoleCatalog, useTeams } from '@/hooks/useUsersAdmin'
import { usersAdminService } from '@/services/usersAdmin.service'
import { permissionDefs, permissionMatrix, type RoleCatalogItem } from '@/data/mockUsersAdmin'
import { cn } from '@/lib/cn'
import type { WorkerRole } from '@/types/inbound'

export function RolesPage() {
  const rolesQ = useRoleCatalog()
  const teamsQ = useTeams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<RoleCatalogItem[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', teamId: '' })

  const roles = useMemo(() => {
    const base = rolesQ.data ?? []
    return [...base, ...drafts]
  }, [rolesQ.data, drafts])

  const selected = roles.find((r) => r.id === selectedId) ?? roles[0]
  const teamName = (id: string) => teamsQ.data?.find((t) => t.id === id)?.name ?? id
  const usersOnRole = selected ? usersAdminService.workersOnRole(selected.role) : []
  const perms = selected ? permissionMatrix[selected.role as WorkerRole] ?? [] : []

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Roles assigned to warehouse users and who holds them."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            onClick={() => {
              setForm({ name: '', description: '', teamId: teamsQ.data?.[0]?.id ?? '' })
              setDrawerOpen(true)
            }}
          >
            Add role
          </button>
        }
      />

      {rolesQ.isLoading ? <LoadingPanel label="Loading roles…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((r) => {
                  const count = usersAdminService.workersOnRole(r.role).length
                  const active = (selected?.id ?? roles[0]?.id) === r.id
                  return (
                    <tr
                      key={r.id}
                      className={cn('cursor-pointer hover:bg-sky-50/50', active && 'bg-sky-50')}
                      onClick={() => setSelectedId(r.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-500">{r.description}</div>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">{teamName(r.teamId)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{count}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'rounded-lg px-2 py-1 text-xs font-bold ring-1',
                            r.status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                              : 'bg-slate-100 text-slate-600 ring-slate-200'
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel flex flex-col p-4">
            <h2 className="font-heading text-base text-slate-900">{selected.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Users with this role
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {usersOnRole.map((u) => (
                <li key={u.id}>
                  <Link
                    to={`/inbound/workers/${u.id}`}
                    className="block cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium text-sky-800 hover:bg-sky-50"
                  >
                    {u.name}
                  </Link>
                </li>
              ))}
              {usersOnRole.length === 0 ? (
                <li className="px-2 text-xs text-slate-400">No users assigned</li>
              ) : null}
            </ul>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Permission summary
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {perms.map((pid) => {
                const def = permissionDefs.find((p) => p.id === pid)
                return (
                  <li key={pid} className="rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-700">
                    {def?.label ?? pid}
                  </li>
                )
              })}
            </ul>
            <Link
              to="/users/permissions"
              className="mt-4 text-xs font-semibold text-sky-700 hover:underline"
            >
              Edit in Permissions →
            </Link>
          </aside>
        ) : null}
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-heading text-lg text-slate-900">Add role (mock)</h3>
              <p className="text-xs text-slate-500">Saved in this session only.</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <label className="block text-xs font-semibold text-slate-600">
                Name
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Description
                <textarea
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Default team
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.teamId}
                  onChange={(e) => setForm((f) => ({ ...f, teamId: e.target.value }))}
                >
                  {(teamsQ.data ?? []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setDrawerOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                disabled={!form.name.trim()}
                onClick={() => {
                  const id = `role-draft-${Date.now()}`
                  setDrafts((d) => [
                    ...d,
                    {
                      id,
                      role: 'PICKER',
                      name: form.name.trim(),
                      description: form.description.trim() || 'Custom mock role',
                      teamId: form.teamId,
                      status: 'active',
                    },
                  ])
                  setSelectedId(id)
                  setDrawerOpen(false)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
