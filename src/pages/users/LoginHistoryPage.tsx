import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useLoginSessions } from '@/hooks/useUsersAdmin'
import { roleJobLabel } from '@/lib/shifts'
import { cn } from '@/lib/cn'

function formatWhen(iso: string | null) {
  if (!iso) return 'Still active'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LoginHistoryPage() {
  const sessionsQ = useLoginSessions()
  const [workerQ, setWorkerQ] = useState('')
  const [result, setResult] = useState<'' | 'success' | 'failed'>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const rows = useMemo(() => {
    let list = sessionsQ.data ?? []
    const needle = workerQ.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (s) =>
          s.workerName.toLowerCase().includes(needle) ||
          roleJobLabel(s.role).toLowerCase().includes(needle)
      )
    }
    if (result) list = list.filter((s) => s.result === result)
    if (from) {
      const t = new Date(from).getTime()
      list = list.filter((s) => new Date(s.loggedInAt).getTime() >= t)
    }
    if (to) {
      const t = new Date(to)
      t.setHours(23, 59, 59, 999)
      list = list.filter((s) => new Date(s.loggedInAt).getTime() <= t.getTime())
    }
    return list
  }, [sessionsQ.data, workerQ, result, from, to])

  return (
    <div>
      <PageHeader
        title="Login History"
        description="When workers signed in to do assigned work. Mock sessions for demo."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          className="surface-input min-w-[180px] flex-1 px-3 py-2 text-sm"
          placeholder="Filter by worker or role…"
          value={workerQ}
          onChange={(e) => setWorkerQ(e.target.value)}
        />
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={result}
          onChange={(e) => setResult(e.target.value as '' | 'success' | 'failed')}
        >
          <option value="">All results</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <input
          type="date"
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          type="date"
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {sessionsQ.isLoading ? <LoadingPanel label="Loading login history…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Login</th>
                <th className="px-4 py-3">Logout</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-semibold text-slate-900">{s.workerName}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                    {roleJobLabel(s.role)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatWhen(s.loggedInAt)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatWhen(s.loggedOutAt)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.device}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.ip}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-bold ring-1',
                        s.result === 'success'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-rose-50 text-rose-800 ring-rose-200'
                      )}
                    >
                      {s.result === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !sessionsQ.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                    No login sessions match these filters.
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
