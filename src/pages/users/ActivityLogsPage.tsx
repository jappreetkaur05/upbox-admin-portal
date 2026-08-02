import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useWorkers } from '@/hooks/useInbound'
import { usersAdminService } from '@/services/usersAdmin.service'
import { roleJobLabel } from '@/lib/shifts'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityLogsPage() {
  const workersQ = useWorkers()
  const today = startOfToday()

  const rows = useMemo(() => {
    const list = (workersQ.data ?? []).filter((w) => w.activity.length > 0)
    return list
      .map((w) => {
        const sorted = [...w.activity].sort(
          (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
        )
        const last = sorted[0]
        const todayCount = w.activity.filter((e) => new Date(e.at).getTime() >= today).length
        return {
          worker: w,
          lastAt: last?.at ?? '',
          todayCount,
          total: w.activity.length,
        }
      })
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
  }, [workersQ.data, today])

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Workers who have performed work. Open a row for the full timeline."
      />

      {workersQ.isLoading ? <LoadingPanel label="Loading activity…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3">Today</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ worker: w, lastAt, todayCount, total }) => (
                <tr key={w.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{w.name}</div>
                    <div className="text-xs text-slate-500">{w.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                    {roleJobLabel(w.role)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {usersAdminService.teamName(w.teamId)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatWhen(lastAt)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{todayCount}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{total}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/users/activity-logs/${w.id}`}
                      className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                    >
                      View work →
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !workersQ.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No work activity recorded yet.
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
