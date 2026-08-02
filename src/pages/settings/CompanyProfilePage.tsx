import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCompanyProfile, useSaveCompanyProfile } from '@/hooks/useSettingsAdmin'
import { settingsAdminService } from '@/services/settingsAdmin.service'
import type { CompanyProfile } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

export function CompanyProfilePage() {
  const q = useCompanyProfile()
  const save = useSaveCompanyProfile()
  const toast = useToastStore((s) => s.push)
  const [form, setForm] = useState<CompanyProfile | null>(null)
  const snap = settingsAdminService.dashboardSnapshot()

  useEffect(() => {
    if (q.data) setForm({ ...q.data })
  }, [q.data])

  if (q.isLoading || !form) {
    return (
      <div>
        <PageHeader title="Company Profile" description="Organization identity and localization." />
        <LoadingPanel label="Loading company profile…" />
      </div>
    )
  }

  const set = <K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) =>
    setForm({ ...form, [key]: value })

  return (
    <div>
      <PageHeader
        title="Company Profile"
        description="Used across invoices, reports, and regulatory documents."
        actions={
          <Link
            to="/settings/tax"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Tax settings
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-panel p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500">Company</p>
          <p className="mt-1 font-heading text-sm font-semibold">{snap.companyName}</p>
        </div>
        <div className="surface-panel p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500">Warehouses</p>
          <p className="mt-1 font-heading text-sm font-semibold">{snap.warehousesActive} active</p>
        </div>
        <div className="surface-panel p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500">GST</p>
          <p className="mt-1 font-heading text-sm font-semibold">
            {snap.gstActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="surface-panel p-3">
          <p className="text-[10px] font-bold uppercase text-slate-500">System health</p>
          <p className="mt-1 font-heading text-sm font-semibold capitalize text-emerald-700">
            {snap.systemHealth}
          </p>
        </div>
      </div>

      <section className="surface-panel max-w-2xl space-y-3 p-5">
        {(
          [
            ['name', 'Company name'],
            ['logoUrl', 'Logo URL'],
            ['gstin', 'GSTIN'],
            ['pan', 'PAN'],
            ['cin', 'CIN'],
            ['contactEmail', 'Contact email'],
            ['contactPhone', 'Contact phone'],
            ['timezone', 'Time zone'],
            ['currency', 'Currency'],
            ['language', 'Language'],
            ['dateFormat', 'Date format'],
            ['businessHours', 'Business hours'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-xs font-semibold text-slate-600">
            {label}
            <input
              className="surface-input mt-1 w-full"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
            />
          </label>
        ))}
        <label className="block text-xs font-semibold text-slate-600">
          Registered address
          <textarea
            className="surface-input mt-1 w-full"
            rows={3}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </label>
        <button
          type="button"
          className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={save.isPending}
          onClick={() =>
            save.mutate(form, {
              onSuccess: () => toast('Company profile saved'),
              onError: (e) => toast((e as Error).message, 'error'),
            })
          }
        >
          Save profile
        </button>
      </section>
    </div>
  )
}
