import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { WorkerWorkPanel } from '@/components/inbound/WorkerWorkPanel'
import { useWorker } from '@/hooks/useInbound'
import { usersAdminService } from '@/services/usersAdmin.service'
import { roleJobLabel } from '@/lib/shifts'

export function ActivityLogDetailPage() {
  const { workerId } = useParams<{ workerId: string }>()
  const workerQ = useWorker(workerId)
  const worker = workerQ.data

  return (
    <div>
      <PageHeader
        title={worker ? `${worker.name} — work timeline` : 'Activity detail'}
        description={
          worker
            ? `${roleJobLabel(worker.role)} · ${usersAdminService.teamName(worker.teamId)} · ${worker.email}`
            : undefined
        }
        actions={
          <div className="flex gap-2">
            <Link
              to="/users/activity-logs"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Activity logs
            </Link>
            {worker ? (
              <Link
                to={`/inbound/workers/${worker.id}`}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                User profile
              </Link>
            ) : null}
          </div>
        }
      />

      {!workerQ.isLoading && !worker ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          Worker not found.
        </div>
      ) : (
        <WorkerWorkPanel worker={worker} loading={workerQ.isLoading} />
      )}
    </div>
  )
}
