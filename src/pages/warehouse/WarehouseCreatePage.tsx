import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { useCreateWarehouse } from '@/hooks/useWarehouseAdmin'

export function WarehouseCreatePage() {
  const navigate = useNavigate()
  const create = useCreateWarehouse()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    timezone: 'Asia/Kolkata',
    operatingHours: '08:00 – 20:00',
    notes: '',
  })

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const wh = await create.mutateAsync({
        name: form.name,
        code: form.code,
        address: form.address,
        city: form.city,
        timezone: form.timezone,
        operatingHours: form.operatingHours,
        notes: form.notes || undefined,
      })
      navigate(`/warehouse/list`, { replace: true, state: { createdId: wh.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Warehouse"
        description="Add a new warehouse. Default purpose zones are seeded automatically."
        actions={
          <Link
            to="/warehouse/list"
            className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to list
          </Link>
        }
      />

      <form onSubmit={onSubmit} className="surface-panel mx-auto max-w-2xl space-y-4 p-6">
        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        <label className="block text-xs font-semibold text-slate-600">
          Name <span className="text-rose-500">*</span>
          <input
            required
            className="surface-input mt-1 w-full px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Upbox Chennai Hub"
          />
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          Code <span className="text-rose-500">*</span>
          <input
            required
            className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm uppercase"
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            placeholder="UPX-CHN-04"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Address <span className="text-rose-500">*</span>
            <input
              required
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            City <span className="text-rose-500">*</span>
            <input
              required
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            Timezone
            <input
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.timezone}
              onChange={(e) => set('timezone', e.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Operating hours
            <input
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.operatingHours}
              onChange={(e) => set('operatingHours', e.target.value)}
            />
          </label>
        </div>

        <label className="block text-xs font-semibold text-slate-600">
          Notes
          <textarea
            className="surface-input mt-1 w-full px-3 py-2 text-sm"
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>

        <p className="text-xs text-slate-500">
          On create, zones for Receiving, Storage/Pick, Packing, Dispatch, and Inspection are added
          with Active status.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            to="/warehouse/list"
            className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={create.isPending}
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creating…' : 'Create warehouse'}
          </button>
        </div>
      </form>
    </div>
  )
}
