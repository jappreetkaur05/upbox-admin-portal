import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useUserActivity } from '@/hooks/useReportsAdmin'
import { ACTIVITY_TYPE_LABELS, type UserActivityType } from '@/types/reportsAdmin'

export function UserActivityPage() {
  const q = useUserActivity()
  const [type, setType] = useState<UserActivityType | 'all'>('all')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase()
    return (q.data ?? []).filter((e) => {
      if (type !== 'all' && e.type !== type) return false
      if (!s) return true
      return (
        e.user.toLowerCase().includes(s) ||
        e.entity.toLowerCase().includes(s) ||
        e.detail.toLowerCase().includes(s)
      )
    })
  }, [q.data, type, search])

  return (
    <div>
      <PageHeader
        title="User Activity"
        description="Login history, inventory changes, order processing, scans, adjustments, and approvals."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          className="surface-input"
          value={type}
          onChange={(e) => setType(e.target.value as UserActivityType | 'all')}
        >
          <option value="all">All activity types</option>
          {(Object.keys(ACTIVITY_TYPE_LABELS) as UserActivityType[]).map((t) => (
            <option key={t} value={t}>
              {ACTIVITY_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <input
          className="surface-input min-w-[220px]"
          placeholder="Search user, entity, detail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading activity…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Entity</th>
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
                      {ACTIVITY_TYPE_LABELS[e.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{e.user}</td>
                  <td className="px-4 py-3 text-slate-600">{e.entity}</td>
                  <td className="px-4 py-3 text-slate-700">{e.detail}</td>
                </tr>
              ))}
              {rows.length === 0 && !q.isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No activity matching filters.
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
