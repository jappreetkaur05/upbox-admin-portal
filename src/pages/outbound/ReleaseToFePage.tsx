import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { useReleaseBagToFe, useRouteBags } from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'

export function ReleaseToFePage() {
  const bagsQ = useRouteBags()
  const release = useReleaseBagToFe()
  const toast = useToastStore((s) => s.push)

  const readyToRelease = (bagsQ.data ?? []).filter((b) => b.status === 'ASSIGNED')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Release to FE' }]} />
      <PageHeader
        title="Release to field executive"
        description="Release assigned route bags to FEs for last-mile delivery."
      />

      <div className="grid gap-4">
        {readyToRelease.map((bag) => (
          <section key={bag.id} className="surface-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg">{bag.bagBarcode}</h3>
                <p className="text-sm text-slate-600">{bag.routeName} · {bag.routeCode}</p>
                <p className="mt-1 text-xs text-slate-500">
                  FE <span className="font-semibold">{bag.feName}</span> · {bag.orderIds.length} orders
                  {bag.assignedAt ? ` · Assigned ${new Date(bag.assignedAt).toLocaleString()}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label="Ready to release" tone="amber" />
                <button
                  type="button"
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
                  disabled={release.isPending}
                  onClick={async () => {
                    try {
                      await release.mutateAsync(bag.id)
                      toast(`Released ${bag.bagBarcode} to ${bag.feName}`, 'success')
                    } catch (e) {
                      toast((e as Error).message, 'error')
                    }
                  }}
                >
                  Release bag to FE
                </button>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {bag.orderIds.map((oid) => (
                <li key={oid} className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600">
                  {oid}
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!readyToRelease.length && !bagsQ.isLoading ? (
          <p className="text-sm text-slate-500">No bags ready for release — assign sealed bags to an FE first.</p>
        ) : null}
      </div>
    </div>
  )
}
