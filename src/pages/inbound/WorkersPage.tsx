import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChartColumn, Search, Users } from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useAssignWorkerJob, useWorkers } from '@/hooks/useInbound'
import { useTeams } from '@/hooks/useUsersAdmin'
import { useAuthStore } from '@/store/useAuthStore'
import { ASSIGNABLE_JOBS, roleJobLabel } from '@/lib/shifts'
import { usersAdminService } from '@/services/usersAdmin.service'
import type { WarehouseWorker, WorkerRole } from '@/types/inbound'
import { cn } from '@/lib/cn'

function statusLabel(s: WarehouseWorker['status']) {
  if (s === 'active') return 'Active'
  if (s === 'on_leave') return 'On leave'
  return 'Inactive'
}

function statusClass(s: WarehouseWorker['status']) {
  if (s === 'active') return 'bg-emerald-50 text-emerald-800 ring-emerald-200'
  if (s === 'on_leave') return 'bg-amber-50 text-amber-900 ring-amber-200'
  return 'bg-slate-100 text-slate-600 ring-slate-200'
}

function formatWhen(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function WorkersPage() {
  const setUserRoles = useAuthStore((s) => s.setUserRoles)
  const currentWorkerId = useAuthStore((s) => s.user?.workerId)
  const workersQ = useWorkers()
  const teamsQ = useTeams()
  const assignJob = useAssignWorkerJob()
  const [searchParams, setSearchParams] = useSearchParams()
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  const filterRole = searchParams.get('role') ?? ''
  const filterTeam = searchParams.get('team') ?? ''
  const filterStatus = searchParams.get('status') ?? ''

  const workers = workersQ.data ?? []
  const teams = teamsQ.data ?? []

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return workers.filter((w) => {
      if (filterRole && w.role !== filterRole) return false
      if (filterTeam && w.teamId !== filterTeam) return false
      if (filterStatus && w.status !== filterStatus) return false
      if (!needle) return true
      return (
        w.name.toLowerCase().includes(needle) ||
        w.email.toLowerCase().includes(needle) ||
        roleJobLabel(w.role).toLowerCase().includes(needle)
      )
    })
  }, [workers, q, filterRole, filterTeam, filterStatus])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const onAssign = async (worker: WarehouseWorker, role: Exclude<WarehouseWorker['role'], 'WMS_SUPERVISOR'>) => {
    setError(null)
    try {
      await assignJob.mutateAsync({ workerId: worker.id, role })
      if (worker.id === currentWorkerId) setUserRoles([role])
      showToast(`${worker.name} → ${roleJobLabel(role)}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed')
    }
  }

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value) next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Everyone who works, has worked, or can be assigned work in the warehouse."
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="font-semibold text-slate-800">
              {filtered.length} / {workers.length} users
            </span>
          </div>
        }
      />

      {toast ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, role…"
            className="surface-input w-full py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={filterRole}
          onChange={(e) => setFilter('role', e.target.value)}
        >
          <option value="">All roles</option>
          {ASSIGNABLE_JOBS.map((j) => (
            <option key={j.value} value={j.value}>
              {j.label}
            </option>
          ))}
          <option value="WMS_SUPERVISOR">Supervisor</option>
        </select>
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={filterTeam}
          onChange={(e) => setFilter('team', e.target.value)}
        >
          <option value="">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On leave</option>
        </select>
      </div>

      {workersQ.isLoading ? <LoadingPanel label="Loading users…" /> : null}

      {workersQ.data ? (
        <section className="surface-panel overflow-hidden">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">
            User roster
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Last active</th>
                  <th className="px-4 py-3">Open work</th>
                  <th className="px-4 py-3">Assign role</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((w) => {
                  const isSupervisor = w.role === 'WMS_SUPERVISOR'
                  return (
                    <tr key={w.id} className="hover:bg-sky-50/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{w.name}</div>
                        <div className="text-xs text-slate-500">{w.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-lg px-2 py-1 text-xs font-bold ring-1',
                            statusClass(w.status)
                          )}
                        >
                          {statusLabel(w.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-900 ring-1 ring-sky-200">
                          {roleJobLabel(w.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700">
                        {usersAdminService.teamName(w.teamId)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{formatWhen(w.lastLoginAt)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {w.openProductCount > 0 ? w.openProductCount : w.activity.length || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {isSupervisor ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <select
                            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
                            value={w.role}
                            disabled={assignJob.isPending}
                            onChange={(e) =>
                              void onAssign(w, e.target.value as Exclude<WorkerRole, 'WMS_SUPERVISOR'>)
                            }
                          >
                            {ASSIGNABLE_JOBS.map((j) => (
                              <option key={j.value} value={j.value}>
                                {j.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/inbound/workers/${w.id}`}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <ChartColumn className="h-3.5 w-3.5" />
                          Open
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                      No users match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
