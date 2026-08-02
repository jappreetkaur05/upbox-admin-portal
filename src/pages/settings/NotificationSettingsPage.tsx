import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useNotificationChannels,
  useNotificationRules,
  useSaveNotifications,
} from '@/hooks/useSettingsAdmin'
import {
  NOTIFY_EVENT_LABELS,
  type NotificationChannels,
  type NotificationRule,
  type NotifyChannel,
} from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

const CHANNELS: { key: NotifyChannel; label: string; masterKey: keyof NotificationChannels }[] = [
  { key: 'email', label: 'Email', masterKey: 'email' },
  { key: 'sms', label: 'SMS', masterKey: 'sms' },
  { key: 'in_app', label: 'In-app', masterKey: 'inApp' },
  { key: 'push', label: 'Push', masterKey: 'push' },
]

export function NotificationSettingsPage() {
  const chQ = useNotificationChannels()
  const rulesQ = useNotificationRules()
  const save = useSaveNotifications()
  const toast = useToastStore((s) => s.push)
  const [channels, setChannels] = useState<NotificationChannels | null>(null)
  const [rules, setRules] = useState<NotificationRule[] | null>(null)

  useEffect(() => {
    if (chQ.data) setChannels({ ...chQ.data })
  }, [chQ.data])

  useEffect(() => {
    if (rulesQ.data) setRules(rulesQ.data.map((r) => ({ ...r, channels: [...r.channels] })))
  }, [rulesQ.data])

  if (chQ.isLoading || rulesQ.isLoading || !channels || !rules) {
    return (
      <div>
        <PageHeader title="Notification Settings" description="Channels and event triggers." />
        <LoadingPanel label="Loading notifications…" />
      </div>
    )
  }

  const toggleRuleChannel = (id: string, ch: NotifyChannel) => {
    setRules(
      rules.map((r) => {
        if (r.id !== id) return r
        const has = r.channels.includes(ch)
        return {
          ...r,
          channels: has ? r.channels.filter((c) => c !== ch) : [...r.channels, ch],
        }
      }),
    )
  }

  return (
    <div>
      <PageHeader
        title="Notification Settings"
        description="Control email, SMS, in-app, and push alerts for warehouse events."
        actions={
          <Link
            to="/settings/email-sms"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Email & SMS templates
          </Link>
        }
      />

      <section className="surface-panel mb-4 p-4">
        <h2 className="font-heading text-base font-semibold">Channels</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {CHANNELS.map((c) => (
            <label key={c.key} className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={channels[c.masterKey]}
                onChange={(e) => setChannels({ ...channels, [c.masterKey]: e.target.checked })}
              />
              {c.label}
            </label>
          ))}
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Enabled</th>
                {CHANNELS.map((c) => (
                  <th key={c.key} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{NOTIFY_EVENT_LABELS[r.event]}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={(e) =>
                        setRules(
                          rules.map((x) =>
                            x.id === r.id ? { ...x, enabled: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                  </td>
                  {CHANNELS.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <input
                        type="checkbox"
                        disabled={!r.enabled || !channels[c.masterKey]}
                        checked={r.channels.includes(c.key)}
                        onChange={() => toggleRuleChannel(r.id, c.key)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button
        type="button"
        className="mt-4 cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        disabled={save.isPending}
        onClick={() =>
          save.mutate(
            { channels, rules },
            {
              onSuccess: () => toast('Notification settings saved'),
              onError: (e) => toast((e as Error).message, 'error'),
            },
          )
        }
      >
        Save notifications
      </button>
    </div>
  )
}
