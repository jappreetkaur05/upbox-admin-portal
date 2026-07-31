import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import { useFeCheckIns, useVerifyFe } from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'

const DEMO_OTP = '123456'

export function FeCheckInPage() {
  const checkInsQ = useFeCheckIns()
  const verify = useVerifyFe()
  const toast = useToastStore((s) => s.push)
  const [otpById, setOtpById] = useState<Record<string, string>>({})

  const pending = (checkInsQ.data ?? []).filter((c) => c.status === 'PENDING')
  const verified = (checkInsQ.data ?? []).filter((c) => c.status === 'VERIFIED')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'FE check-in' }]} />
      <PageHeader
        title="Field executive check-in"
        description="Verify FEs who are on site. Only verified FEs can receive bags."
      />

      <OutboundChrome
        what="Verify FEs present at the warehouse (OTP)."
        doNow={
          pending.length
            ? `${pending.length} FE(s) waiting for verification.`
            : verified.length
              ? 'All checked-in FEs are verified — assign sealed bags next.'
              : 'No FE check-ins yet.'
        }
        nextLabel="Next: Assign FE"
        nextTo="/outbound/assign-fe"
      >
        <section className="surface-card mb-6 p-5">
          <h2 className="font-heading text-base">Pending verification</h2>
          <p className="mt-1 text-xs text-slate-500">Demo OTP for all check-ins: {DEMO_OTP}</p>
          <ul className="mt-3 space-y-3">
            {pending.map((c) => (
              <li key={c.id} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.feName}</p>
                    <p className="text-xs text-slate-500">
                      {c.employeeId} · {c.phone}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label="Pending" tone="amber" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="OTP"
                      value={otpById[c.id] ?? ''}
                      onChange={(e) => setOtpById((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 font-mono text-xs"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={verify.isPending}
                      onClick={async () => {
                        const otp = otpById[c.id] ?? DEMO_OTP
                        try {
                          await verify.mutateAsync({ id: c.id, otp })
                          toast(`${c.feName} verified`, 'success')
                        } catch (e) {
                          toast((e as Error).message, 'error')
                        }
                      }}
                    >
                      Verify FE
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!pending.length ? <p className="text-sm text-slate-500">No pending FE check-ins.</p> : null}
          </ul>
        </section>

        <section className="surface-card p-5">
          <h2 className="font-heading text-base">Verified today</h2>
          <ul className="mt-3 space-y-2">
            {verified.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold">{c.feName}</p>
                  <p className="text-xs text-slate-500">{c.employeeId}</p>
                </div>
                <div className="text-right">
                  <StatusBadge label="Verified" tone="green" />
                  {c.verifiedAt ? (
                    <p className="mt-1 text-[11px] text-slate-400">{new Date(c.verifiedAt).toLocaleString()}</p>
                  ) : null}
                </div>
              </li>
            ))}
            {!verified.length ? <p className="text-sm text-slate-500">No verified check-ins yet.</p> : null}
          </ul>
        </section>
      </OutboundChrome>
    </div>
  )
}
