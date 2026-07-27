import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Columns3, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EmptyState } from '@/components/ui/EmptyState'

export type DataColumn<T> = {
  id: string
  header: string
  accessor: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  defaultVisible?: boolean
}

export function DataTable<T extends { id: string }>(props: {
  rows: T[]
  columns: DataColumn<T>[]
  loading?: boolean
  error?: string | null
  searchPlaceholder?: string
  searchFn?: (row: T, q: string) => boolean
  pageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
  onToggleSelectAll?: (ids: string[]) => void
  bulkActions?: ReactNode
  onRowClick?: (row: T) => void
  toolbar?: ReactNode
}) {
  const [q, setQ] = useState('')
  const [sortId, setSortId] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(props.columns.map((c) => [c.id, c.defaultVisible !== false]))
  )
  const [showCols, setShowCols] = useState(false)
  const pageSize = props.pageSize ?? 8

  const filtered = useMemo(() => {
    let rows = props.rows
    if (q && props.searchFn) rows = rows.filter((r) => props.searchFn!(r, q.toLowerCase()))
    else if (q) {
      rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
    }
    if (sortId) {
      const col = props.columns.find((c) => c.id === sortId)
      if (col?.sortValue) {
        rows = [...rows].sort((a, b) => {
          const av = col.sortValue!(a)
          const bv = col.sortValue!(b)
          const cmp = av < bv ? -1 : av > bv ? 1 : 0
          return sortDir === 'asc' ? cmp : -cmp
        })
      }
    }
    return rows
  }, [props.rows, props.columns, props.searchFn, q, sortId, sortDir])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize)
  const visibleCols = props.columns.filter((c) => visible[c.id])

  if (props.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
        {props.error}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
            placeholder={props.searchPlaceholder ?? 'Search…'}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-400 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {props.toolbar}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCols((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Columns3 className="h-3.5 w-3.5" />
              Columns
            </button>
            {showCols ? (
              <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {props.columns.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!!visible[c.id]}
                      onChange={() => setVisible((v) => ({ ...v, [c.id]: !v[c.id] }))}
                    />
                    {c.header}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {props.selectedIds && props.selectedIds.length > 0 && props.bulkActions ? (
        <div className="flex items-center justify-between gap-3 border-b border-primary-100 bg-primary-50 px-4 py-2 text-sm">
          <span className="font-medium text-primary-800">{props.selectedIds.length} selected</span>
          <div className="flex flex-wrap gap-2">{props.bulkActions}</div>
        </div>
      ) : null}

      {props.loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-4">
          <EmptyState title={props.emptyTitle ?? 'No rows'} description={props.emptyDescription} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {props.onToggleSelect ? (
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={pageRows.every((r) => props.selectedIds?.includes(r.id)) && pageRows.length > 0}
                      onChange={() => props.onToggleSelectAll?.(pageRows.map((r) => r.id))}
                    />
                  </th>
                ) : null}
                {visibleCols.map((c) => (
                  <th key={c.id} className={cn('px-3 py-3 font-semibold', c.className)}>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => {
                        if (!c.sortValue) return
                        if (sortId === c.id) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                        else {
                          setSortId(c.id)
                          setSortDir('asc')
                        }
                      }}
                    >
                      {c.header}
                      {sortId === c.id ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : null}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition hover:bg-slate-50/80',
                    props.onRowClick && 'cursor-pointer',
                    props.selectedIds?.includes(row.id) && 'bg-primary-50/40'
                  )}
                  onClick={() => props.onRowClick?.(row)}
                >
                  {props.onToggleSelect ? (
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!props.selectedIds?.includes(row.id)}
                        onChange={() => props.onToggleSelect?.(row.id)}
                      />
                    </td>
                  ) : null}
                  {visibleCols.map((c) => (
                    <td key={c.id} className={cn('px-3 py-3 text-slate-700', c.className)}>
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <span>
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-slate-200 px-2.5 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="rounded-lg border border-slate-200 px-2.5 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
