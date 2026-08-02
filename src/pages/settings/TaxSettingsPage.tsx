import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSaveTaxSetting, useTaxSetting } from '@/hooks/useSettingsAdmin'
import type { TaxSetting } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

export function TaxSettingsPage() {
  const q = useTaxSetting()
  const save = useSaveTaxSetting()
  const toast = useToastStore((s) => s.push)
  const [form, setForm] = useState<TaxSetting | null>(null)

  useEffect(() => {
    if (q.data) {
      setForm({
        ...q.data,
        categories: q.data.categories.map((c) => ({ ...c })),
        hsnSamples: q.data.hsnSamples.map((h) => ({ ...h })),
      })
    }
  }, [q.data])

  if (q.isLoading || !form) {
    return (
      <div>
        <PageHeader title="Tax Settings" description="GST rates, categories, and HSN." />
        <LoadingPanel label="Loading tax settings…" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Tax Settings"
        description="GST configuration for automatic tax calculation and compliance."
        actions={
          <Link
            to="/reports/financial"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Financial reports
          </Link>
        }
      />

      <section className="surface-panel mb-4 max-w-xl space-y-3 p-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.gstActive}
            onChange={(e) => setForm({ ...form, gstActive: e.target.checked })}
          />
          GST configuration active
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ['cgst', 'CGST %'],
              ['sgst', 'SGST %'],
              ['igst', 'IGST %'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-slate-600">
              {label}
              <input
                type="number"
                className="surface-input mt-1 w-full"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.reverseCharge}
            onChange={(e) => setForm({ ...form, reverseCharge: e.target.checked })}
          />
          Reverse charge
        </label>
        <button
          type="button"
          className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          disabled={save.isPending}
          onClick={() =>
            save.mutate(form, {
              onSuccess: () => toast('Tax settings saved'),
              onError: (e) => toast((e as Error).message, 'error'),
            })
          }
        >
          Save tax settings
        </button>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-panel overflow-hidden">
          <h2 className="border-b px-4 py-3 font-heading text-base font-semibold">
            Tax categories
          </h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2 text-right font-semibold">{c.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="surface-panel overflow-hidden">
          <h2 className="border-b px-4 py-3 font-heading text-base font-semibold">HSN samples</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">HSN</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {form.hsnSamples.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-2 font-mono text-xs">{h.code}</td>
                  <td className="px-4 py-2">{h.description}</td>
                  <td className="px-4 py-2 text-right font-semibold">{h.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
