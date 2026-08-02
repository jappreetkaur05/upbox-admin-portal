import { useEffect, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSaveScannerSettings, useScannerSettings } from '@/hooks/useBarcodesAdmin'
import {
  CONNECTION_LABELS,
  SCAN_ACTION_LABELS,
  type ScanAction,
  type ScannerConnection,
  type ScannerSettings,
} from '@/types/barcodesAdmin'

export function ScannerSettingsPage() {
  const settingsQ = useScannerSettings()
  const save = useSaveScannerSettings()
  const [form, setForm] = useState<ScannerSettings | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (settingsQ.data) setForm({ ...settingsQ.data })
  }, [settingsQ.data])

  if (settingsQ.isLoading || !form) {
    return (
      <div>
        <PageHeader title="Scanner Settings" description="Configure warehouse barcode scanners." />
        <LoadingPanel label="Loading settings…" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Scanner Settings"
        description="Device, scan mode, feedback, and default action for warehouse scanners."
      />

      {toast ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      ) : null}

      <section className="surface-panel max-w-xl space-y-4 p-5">
        <label className="block text-xs font-semibold text-slate-600">
          Scanner device
          <input
            className="surface-input mt-1 w-full px-3 py-2 text-sm"
            value={form.deviceName}
            onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          Connection
          <select
            className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
            value={form.connection}
            onChange={(e) =>
              setForm({ ...form, connection: e.target.value as ScannerConnection })
            }
          >
            {(Object.keys(CONNECTION_LABELS) as ScannerConnection[]).map((k) => (
              <option key={k} value={k}>
                {CONNECTION_LABELS[k]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-600">
          Scan mode
          <select
            className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
            value={form.scanMode}
            onChange={(e) =>
              setForm({ ...form, scanMode: e.target.value as 'single' | 'batch' })
            }
          >
            <option value="single">Single scan</option>
            <option value="batch">Batch scan</option>
          </select>
        </label>

        <div className="space-y-2">
          {(
            [
              ['autoScan', 'Auto scan'],
              ['continuous', 'Continuous scan'],
              ['sound', 'Sound'],
              ['vibration', 'Vibration'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              {label}
            </label>
          ))}
        </div>

        <label className="block text-xs font-semibold text-slate-600">
          Default scan action
          <select
            className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
            value={form.defaultAction}
            onChange={(e) => setForm({ ...form, defaultAction: e.target.value as ScanAction })}
          >
            {(Object.keys(SCAN_ACTION_LABELS) as ScanAction[]).map((k) => (
              <option key={k} value={k}>
                {SCAN_ACTION_LABELS[k]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
            onClick={() => {
              setToast(`Test OK — ${form.deviceName} (${CONNECTION_LABELS[form.connection]})`)
              setTimeout(() => setToast(null), 2500)
            }}
          >
            Test scanner
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
            onClick={() => {
              setToast('Calibration mock complete')
              setTimeout(() => setToast(null), 2000)
            }}
          >
            Calibrate
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            disabled={save.isPending}
            onClick={async () => {
              await save.mutateAsync(form)
              setToast('Settings saved')
              setTimeout(() => setToast(null), 2000)
            }}
          >
            Save settings
          </button>
        </div>
      </section>
    </div>
  )
}
