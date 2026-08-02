import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useMessageTemplates, useSaveTemplate } from '@/hooks/useSettingsAdmin'
import type { MessageTemplate, TemplateChannel } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

const SAMPLE: Record<string, string> = {
  orderId: 'ORD-88421',
  customerName: 'Riya Shah',
  amount: '₹8,499',
  courier: 'Delhivery',
  awb: 'AWB998812',
  deliveredAt: '02 Aug 2026',
  returnId: 'RET-102',
  days: '5',
  invoiceNumber: 'INV-2026-8001',
  otp: '482910',
  sku: 'NK-AIR-42',
  warehouse: 'BLR-01',
  qty: '18',
}

function previewBody(body: string) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => SAMPLE[key] ?? `{{${key}}}`)
}

export function EmailSmsTemplatesPage() {
  const [channel, setChannel] = useState<TemplateChannel | 'all'>('all')
  const q = useMessageTemplates(channel === 'all' ? undefined : channel)
  const save = useSaveTemplate()
  const toast = useToastStore((s) => s.push)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState<Omit<MessageTemplate, 'id' | 'version'> & { id?: string }>({
    channel: 'email',
    name: '',
    subject: '',
    body: '',
    variables: [],
    language: 'en',
  })

  const openCreate = () => {
    setForm({
      channel: 'email',
      name: '',
      subject: '',
      body: '',
      variables: [],
      language: 'en',
    })
    setDrawer(true)
  }

  const openEdit = (t: MessageTemplate) => {
    setForm({
      id: t.id,
      channel: t.channel,
      name: t.name,
      subject: t.subject,
      body: t.body,
      variables: [...t.variables],
      language: t.language,
    })
    setDrawer(true)
  }

  const preview = useMemo(() => previewBody(form.body), [form.body])

  return (
    <div>
      <PageHeader
        title="Email & SMS Templates"
        description="Reusable templates with dynamic variables and preview."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={openCreate}
          >
            New template
          </button>
        }
      />

      <div className="mb-3">
        <select
          className="surface-input"
          value={channel}
          onChange={(e) => setChannel(e.target.value as TemplateChannel | 'all')}
        >
          <option value="all">All channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading templates…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Variables</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(q.data ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 uppercase">{t.channel}</td>
                  <td className="px-4 py-3">{t.language}</td>
                  <td className="px-4 py-3">v{t.version}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {t.variables.map((v) => `{{${v}}}`).join(' ')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                      onClick={() => openEdit(t)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-heading text-lg font-semibold">
                {form.id ? 'Edit template' : 'New template'}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm text-slate-500"
                onClick={() => setDrawer(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Name
                <input
                  className="surface-input mt-1 w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Channel
                <select
                  className="surface-input mt-1 w-full"
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value as TemplateChannel })
                  }
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </label>
              {form.channel === 'email' ? (
                <label className="block text-xs font-semibold text-slate-600">
                  Subject
                  <input
                    className="surface-input mt-1 w-full"
                    value={form.subject ?? ''}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </label>
              ) : null}
              <label className="block text-xs font-semibold text-slate-600">
                Body
                <textarea
                  className="surface-input mt-1 w-full font-mono text-xs"
                  rows={5}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Variables (comma-separated)
                <input
                  className="surface-input mt-1 w-full"
                  value={form.variables.join(', ')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      variables: e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase text-slate-500">Preview</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{preview || '—'}</p>
              </div>
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={save.isPending || !form.name.trim() || !form.body.trim()}
                onClick={() =>
                  save.mutate(
                    {
                      ...form,
                      subject: form.channel === 'email' ? form.subject : null,
                    },
                    {
                      onSuccess: () => {
                        toast('Template saved')
                        setDrawer(false)
                      },
                      onError: (e) => toast((e as Error).message, 'error'),
                    },
                  )
                }
              >
                Save template
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
