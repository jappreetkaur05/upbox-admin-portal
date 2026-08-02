import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCourierIntegrations, useUpdateCourier } from '@/hooks/useSettingsAdmin'
import type { CourierIntegration } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

export function CourierIntegrationsPage() {
  const q = useCourierIntegrations()
  const update = useUpdateCourier()
  const toast = useToastStore((s) => s.push)
  const [edit, setEdit] = useState<CourierIntegration | null>(null)
  const [keyInput, setKeyInput] = useState('')

  return (
    <div>
      <PageHeader
        title="Courier Integrations"
        description="API credentials, labels, tracking sync, and pickup scheduling."
        actions={
          <Link
            to="/settings/master-data"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Master couriers
          </Link>
        }
      />

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading couriers…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Courier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">API key</th>
                <th className="px-4 py-3">Services</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3">Pickup</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(q.data ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        c.connected
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.apiKeyMasked}</td>
                  <td className="px-4 py-3 text-xs">{c.services.join(', ')}</td>
                  <td className="px-4 py-3">{c.labelPrinting ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{c.trackingSync ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{c.pickupEnabled ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                        onClick={() =>
                          update.mutate(
                            { id: c.id, patch: { connected: !c.connected } },
                            {
                              onSuccess: () =>
                                toast(c.connected ? 'Disconnected' : 'Connected'),
                            },
                          )
                        }
                      >
                        {c.connected ? 'Disconnect' : 'Connect'}
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                        onClick={() => toast(`Test connection OK · ${c.name}`)}
                      >
                        Test
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                        onClick={() => {
                          setEdit(c)
                          setKeyInput('')
                        }}
                      >
                        Credentials
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {edit ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-heading text-lg font-semibold">{edit.name} credentials</h2>
              <button
                type="button"
                className="cursor-pointer text-sm text-slate-500"
                onClick={() => setEdit(null)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-3 p-4">
              <p className="text-xs text-slate-500">Current: {edit.apiKeyMasked}</p>
              <label className="block text-xs font-semibold text-slate-600">
                New API key
                <input
                  className="surface-input mt-1 w-full"
                  value={keyInput}
                  placeholder="Paste key (stored masked)"
                  onChange={(e) => setKeyInput(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={edit.labelPrinting}
                  onChange={(e) => setEdit({ ...edit, labelPrinting: e.target.checked })}
                />
                Label printing
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={edit.trackingSync}
                  onChange={(e) => setEdit({ ...edit, trackingSync: e.target.checked })}
                />
                Tracking sync
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={edit.pickupEnabled}
                  onChange={(e) => setEdit({ ...edit, pickupEnabled: e.target.checked })}
                />
                Pickup scheduling
              </label>
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white"
                onClick={() => {
                  const masked = keyInput.trim()
                    ? `${keyInput.trim().slice(0, 4)}_••••••••${keyInput.trim().slice(-4)}`
                    : edit.apiKeyMasked
                  update.mutate(
                    {
                      id: edit.id,
                      patch: {
                        apiKeyMasked: masked,
                        labelPrinting: edit.labelPrinting,
                        trackingSync: edit.trackingSync,
                        pickupEnabled: edit.pickupEnabled,
                      },
                    },
                    {
                      onSuccess: () => {
                        toast('Courier credentials updated')
                        setEdit(null)
                      },
                      onError: (e) => toast((e as Error).message, 'error'),
                    },
                  )
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
