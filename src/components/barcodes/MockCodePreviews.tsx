import { cn } from '@/lib/cn'

/** Decorative mock barcode bars — not a real symbology. */
export function MockBarcodeBars({ value, className }: { value: string; className?: string }) {
  const bars = Array.from(value).flatMap((ch, i) => {
    const n = ch.charCodeAt(0) % 5
    return [1 + (n % 3), 1, 2 + ((n + i) % 2)]
  })
  return (
    <div className={cn('flex h-12 items-end gap-px bg-white px-2 py-1', className)} aria-hidden>
      {bars.slice(0, 48).map((w, i) => (
        <span
          key={i}
          className="bg-slate-900"
          style={{ width: w, height: `${70 + (i % 4) * 8}%` }}
        />
      ))}
    </div>
  )
}

export function MockQrTile({ payload }: { payload: string }) {
  return (
    <div
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[repeating-conic-gradient(#0f172a_0%_25%,#fff_0%_50%)] bg-[length:8px_8px]"
      title={payload}
    >
      <span className="rounded bg-white px-1 font-mono text-[9px] font-bold text-slate-800">QR</span>
    </div>
  )
}
