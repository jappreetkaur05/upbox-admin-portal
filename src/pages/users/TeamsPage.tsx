import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useTeams } from '@/hooks/useUsersAdmin'
import { useWorkers } from '@/hooks/useInbound'
import { usersAdminService } from '@/services/usersAdmin.service'
import { roleJobLabel } from '@/lib/shifts'
import type { TeamDept } from '@/data/mockUsersAdmin'
import { cn } from '@/lib/cn'

export function TeamsPage() {
  const teamsQ = useTeams()
  const workersQ = useWorkers()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const teams = teamsQ.data ?? []
  const selected: TeamDept | undefined = teams.find((t) => t.id === selectedId) ?? teams[0]
  const members = selected ? usersAdminService.workersOnTeam(selected.id) : []

  return (
    <div>
      <PageHeader
        title="Teams / Departments"
        description="Where users sit operationally — receiving, picking, packing, and more."
      />

      {teamsQ.isLoading || workersQ.isLoading ? <LoadingPanel label="Loading teams…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {teams.map((t) => {
            const count = usersAdminService.workersOnTeam(t.id).length
            const active = selected?.id === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm',
                  active ? 'border-sky-400 bg-sky-50/60' : 'border-slate-200 bg-white'
                )}
              >
                <h2 className="font-heading text-base text-slate-900">{t.name}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                    {count} members
                  </span>
                  {t.leadName ? (
                    <span className="rounded-lg bg-teal-50 px-2 py-1 font-semibold text-teal-800">
                      Lead: {t.leadName}
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.defaultRoles.map((r) => (
                    <span
                      key={r}
                      className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-800"
                    >
                      {roleJobLabel(r)}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {selected ? (
          <aside className="surface-panel p-4">
            <h2 className="font-heading text-base text-slate-900">{selected.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">Members</p>
            <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto">
              {members.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/inbound/workers/${m.id}`}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sky-50"
                  >
                    <span className="font-medium text-slate-800">{m.name}</span>
                    <span className="text-[11px] font-semibold text-slate-500">{roleJobLabel(m.role)}</span>
                  </Link>
                </li>
              ))}
              {members.length === 0 ? (
                <li className="px-2 text-xs text-slate-400">No members yet</li>
              ) : null}
            </ul>
            <Link
              to={`/inbound/workers?team=${selected.id}`}
              className="mt-4 inline-block text-xs font-semibold text-sky-700 hover:underline"
            >
              Open in Users →
            </Link>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
