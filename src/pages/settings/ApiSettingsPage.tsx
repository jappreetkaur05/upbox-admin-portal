import { useEffect, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useApiIntegrations,
  useApiKeys,
  useApiSecurity,
  useCreateApiKey,
  useRevokeApiKey,
  useSaveApiSecurity,
  useSaveWebhook,
  useWebhooks,
} from '@/hooks/useSettingsAdmin'
import { API_SYSTEM_LABELS } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

type Tab = 'keys' | 'webhooks' | 'systems' | 'security'

export function ApiSettingsPage() {
  const [tab, setTab] = useState<Tab>('keys')
  const keysQ = useApiKeys()
  const webhooksQ = useWebhooks()
  const systemsQ = useApiIntegrations()
  const securityQ = useApiSecurity()
  const createKey = useCreateApiKey()
  const revokeKey = useRevokeApiKey()
  const saveWebhook = useSaveWebhook()
  const saveSecurity = useSaveApiSecurity()
  const toast = useToastStore((s) => s.push)

  const [keyName, setKeyName] = useState('New integration')
  const [whUrl, setWhUrl] = useState('')
  const [whEvents, setWhEvents] = useState('order.created')
  const [security, setSecurity] = useState({ ipWhitelist: '', defaultRateLimit: 1000 })

  useEffect(() => {
    if (securityQ.data) setSecurity({ ...securityQ.data })
  }, [securityQ.data])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'keys', label: 'API keys' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'systems', label: 'Connected systems' },
    { id: 'security', label: 'IP & rate limits' },
  ]

  return (
    <div>
      <PageHeader
        title="API Settings"
        description="Keys, webhooks, OAuth-ready integrations, IP whitelist, and rate limits."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
              tab === t.id
                ? 'bg-sky-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'keys' ? (
        <section className="surface-panel overflow-hidden">
          <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 p-4">
            <label className="text-xs font-semibold text-slate-600">
              Key name
              <input
                className="surface-input mt-1 block"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
              onClick={() =>
                createKey.mutate(
                  { name: keyName, rateLimit: 500 },
                  {
                    onSuccess: (k) => toast(`Generated ${k.keyMasked}`),
                    onError: (e) => toast((e as Error).message, 'error'),
                  },
                )
              }
            >
              Generate key
            </button>
          </div>
          {keysQ.isLoading ? <LoadingPanel label="Loading keys…" /> : null}
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Rate limit</th>
                <th className="px-4 py-3">Last used</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(keysQ.data ?? []).map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.keyMasked}</td>
                  <td className="px-4 py-3">{k.rateLimit}/min</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {k.lastUsed ? new Date(k.lastUsed).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-rose-700 hover:underline"
                      onClick={() =>
                        revokeKey.mutate(k.id, { onSuccess: () => toast('API key revoked') })
                      }
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === 'webhooks' ? (
        <section className="surface-panel overflow-hidden">
          <div className="space-y-2 border-b border-slate-100 p-4">
            <input
              className="surface-input w-full"
              placeholder="Webhook URL"
              value={whUrl}
              onChange={(e) => setWhUrl(e.target.value)}
            />
            <input
              className="surface-input w-full"
              placeholder="Events (comma-separated)"
              value={whEvents}
              onChange={(e) => setWhEvents(e.target.value)}
            />
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
              onClick={() =>
                saveWebhook.mutate(
                  {
                    url: whUrl,
                    events: whEvents.split(',').map((e) => e.trim()).filter(Boolean),
                    active: true,
                  },
                  {
                    onSuccess: () => {
                      toast('Webhook added')
                      setWhUrl('')
                    },
                    onError: (e) => toast((e as Error).message, 'error'),
                  },
                )
              }
            >
              Add webhook
            </button>
          </div>
          {webhooksQ.isLoading ? <LoadingPanel label="Loading webhooks…" /> : null}
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Events</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(webhooksQ.data ?? []).map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 text-xs">{w.url}</td>
                  <td className="px-4 py-3 text-xs">{w.events.join(', ')}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                      onClick={() =>
                        saveWebhook.mutate(
                          { id: w.id, url: w.url, events: w.events, active: !w.active },
                          { onSuccess: () => toast(w.active ? 'Disabled' : 'Enabled') },
                        )
                      }
                    >
                      {w.active ? 'On' : 'Off'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === 'systems' ? (
        <section className="surface-panel overflow-hidden">
          {systemsQ.isLoading ? <LoadingPanel label="Loading systems…" /> : null}
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">System</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(systemsQ.data ?? []).map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{API_SYSTEM_LABELS[s.system]}</td>
                  <td className="px-4 py-3 capitalize">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === 'security' ? (
        <section className="surface-panel max-w-xl space-y-3 p-5">
          {securityQ.isLoading ? <LoadingPanel label="Loading…" /> : null}
          <label className="block text-xs font-semibold text-slate-600">
            IP whitelist (CIDR, comma-separated)
            <textarea
              className="surface-input mt-1 w-full"
              rows={3}
              value={security.ipWhitelist}
              onChange={(e) => setSecurity({ ...security, ipWhitelist: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Default rate limit (req/min)
            <input
              type="number"
              className="surface-input mt-1 w-full"
              value={security.defaultRateLimit}
              onChange={(e) =>
                setSecurity({ ...security, defaultRateLimit: Number(e.target.value) })
              }
            />
          </label>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() =>
              saveSecurity.mutate(security, {
                onSuccess: () => toast('API security saved'),
                onError: (e) => toast((e as Error).message, 'error'),
              })
            }
          >
            Save security
          </button>
        </section>
      ) : null}
    </div>
  )
}
