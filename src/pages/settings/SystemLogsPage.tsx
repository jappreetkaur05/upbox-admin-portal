import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSystemLogs } from '@/hooks/useSettingsAdmin'
import { LOG_CATEGORY_LABELS, type SystemLogCategory } from '@/types/settingsAdmin'

export function SystemLogsPage() {
  const q = useSystemLogs()
  const [category, setCategory] = useState<SystemLogCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase()
    return (q.data ?? []).filter((e) => {
      if (category !== 'all' && e.category !== category) return false
      if (!s) return true
      return (
        e.user.toLowerCase().includes(s) ||
        e.detail.toLowerCase().includes(s) ||
        LOG_CATEGORY_LABELS[e.category].toLowerCase().includes(s)
      )
    })
  }, [q.data, category, search])

  return (
    <div>
      <PageHeader
        title="System Logs"
        description="Login, configuration, inventory, API, security, and database audit trail."
        actions={
          <div className="flex gap-2 text-xs">
            <Link to="/settings/backup" className="text-sky-700 hover:underline">
              Backup
            </Link>
            <Link to="/reports/user-activity" className="text-sky-700 hover:underline">
              User activity reports
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="surface-input"
          value={category}
          onChange={(e) => setCategory(e.target.value as SystemLogCategory | 'all')}
        >
          <option value="all">All categories</option>
          {(Object.keys(LOG_CATEGORY_LABELS) as SystemLogCategory[]).map((c) => (
            <option key={c} value={c}>
              {LOG_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <input
          className="surface-input min-w-[220px]"
          placeholder="Search user or detail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading logs…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(e.at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {LOG_CATEGORY_LABELS[e.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{e.user}</td>
                  <td className="px-4 py-3 text-slate-700">{e.detail}</td>
                </tr>
              ))}
              {rows.length === 0 && !q.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No logs matching filters.
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
