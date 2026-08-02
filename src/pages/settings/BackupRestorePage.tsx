import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useBackupJobs, useRunBackup } from '@/hooks/useSettingsAdmin'
import { settingsAdminService } from '@/services/settingsAdmin.service'
import { BACKUP_TYPE_LABELS, type BackupType } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

const STATUS_TONE: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-800',
  running: 'bg-sky-50 text-sky-800',
  failed: 'bg-rose-50 text-rose-800',
}

export function BackupRestorePage() {
  const q = useBackupJobs()
  const run = useRunBackup()
  const toast = useToastStore((s) => s.push)
  const [type, setType] = useState<BackupType>('full')
  const snap = settingsAdminService.dashboardSnapshot()

  return (
    <div>
      <PageHeader
        title="Backup & Restore"
        description="Scheduled and manual backups with encryption and restore."
        actions={
          <Link
            to="/settings/system-logs"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            System logs
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Last backup
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">{snap.lastBackupLabel}</p>
        </div>
        <div className="surface-panel flex flex-wrap items-end gap-2 p-4">
          <label className="text-xs font-semibold text-slate-600">
            Backup type
            <select
              className="surface-input mt-1 block"
              value={type}
              onChange={(e) => setType(e.target.value as BackupType)}
            >
              {(Object.keys(BACKUP_TYPE_LABELS) as BackupType[]).map((t) => (
                <option key={t} value={t}>
                  {BACKUP_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={run.isPending}
            onClick={() =>
              run.mutate(type, {
                onSuccess: () => toast(`${BACKUP_TYPE_LABELS[type]} backup completed`),
                onError: (e) => toast((e as Error).message, 'error'),
              })
            }
          >
            Run backup
          </button>
        </div>
      </div>

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading backups…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Encrypted</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(q.data ?? []).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{BACKUP_TYPE_LABELS[b.type]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                        STATUS_TONE[b.status]
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(b.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">{b.encrypted ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 max-w-[240px] truncate font-mono text-xs text-slate-600">
                    {b.location}
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'completed' ? (
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-amber-800 hover:underline"
                        onClick={() =>
                          toast(`Restore queued from ${BACKUP_TYPE_LABELS[b.type]} backup`)
                        }
                      >
                        Restore
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
