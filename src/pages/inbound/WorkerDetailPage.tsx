import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { WorkerWorkPanel } from '@/components/inbound/WorkerWorkPanel'
import { useWorker } from '@/hooks/useInbound'
import { useTeams } from '@/hooks/useUsersAdmin'
import { roleJobLabel } from '@/lib/shifts'
import { roleWorkTitle } from '@/lib/workerActivity'
import { cn } from '@/lib/cn'

function statusLabel(s?: string) {
  if (s === 'active') return 'Active'
  if (s === 'on_leave') return 'On leave'
  if (s === 'inactive') return 'Inactive'
  return '—'
}

export function WorkerDetailPage() {
  const { workerId } = useParams<{ workerId: string }>()
  const workerQ = useWorker(workerId)
  const teamsQ = useTeams()
  const worker = workerQ.data
  const teamName = teamsQ.data?.find((t) => t.id === worker?.teamId)?.name

  return (
    <div>
      <PageHeader
        title={worker ? worker.name : 'User'}
        description={
          worker
            ? `${roleWorkTitle(worker.role)} · ${roleJobLabel(worker.role)} · ${worker.email}`
            : undefined
        }
        actions={
          <Link
            to="/inbound/workers"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        }
      />

      {worker ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-bold ring-1',
              worker.status === 'active' && 'bg-emerald-50 text-emerald-800 ring-emerald-200',
              worker.status === 'on_leave' && 'bg-amber-50 text-amber-900 ring-amber-200',
              worker.status === 'inactive' && 'bg-slate-100 text-slate-600 ring-slate-200'
            )}
          >
            {statusLabel(worker.status)}
          </span>
          <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-900 ring-1 ring-sky-200">
            {roleJobLabel(worker.role)}
          </span>
          {teamName ? (
            <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-900 ring-1 ring-teal-200">
              {teamName}
            </span>
          ) : null}
          <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {worker.kind} · {worker.streams.join(' + ')}
          </span>
        </div>
      ) : null}

      {!workerQ.isLoading && !worker ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          User not found.
        </div>
      ) : (
        <WorkerWorkPanel worker={worker} loading={workerQ.isLoading} />
      )}
    </div>
  )
}
