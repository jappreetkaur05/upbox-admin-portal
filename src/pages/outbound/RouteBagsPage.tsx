import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import {
  useOutboundOrders,
  useRouteBags,
  useSealRouteBag,
  useSortReadyIntoRouteBags,
} from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'
import type { OutboundOrder, RouteBag } from '@/types/outbound'

function bagTone(status: RouteBag['status']) {
  if (status === 'SEALED') return 'green' as const
  if (status === 'ASSIGNED') return 'amber' as const
  if (status === 'RELEASED') return 'violet' as const
  return 'blue' as const
}

export function RouteBagsPage() {
  const bagsQ = useRouteBags()
  const ordersQ = useOutboundOrders()
  const sortReady = useSortReadyIntoRouteBags()
  const seal = useSealRouteBag()
  const toast = useToastStore((s) => s.push)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const orderMap = useMemo(() => {
    const map = new Map<string, OutboundOrder>()
    for (const o of ordersQ.data ?? []) map.set(o.id, o)
    return map
  }, [ordersQ.data])

  const bags = bagsQ.data ?? []

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Route bags' }]} />
      <PageHeader
        title="Route bags"
        description="Sort ready orders into route bags, seal bags, and review contents."
        actions={
          <button
            type="button"
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={sortReady.isPending}
            onClick={async () => {
              try {
                const created = await sortReady.mutateAsync()
                toast(`Sorted ${created.length} bag(s) from ready orders`, 'success')
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Sort ready into bags
          </button>
        }
      />

      <div className="grid gap-4">
        {bags.map((bag) => {
          const expanded = expandedId === bag.id
          return (
            <section key={bag.id} className="surface-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                  <h3 className="font-heading text-base">{bag.routeName}</h3>
                  <p className="text-xs text-slate-500">
                    {bag.routeCode} · <span className="font-mono">{bag.bagBarcode}</span> · {bag.orderIds.length} orders
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={bag.status} tone={bagTone(bag.status)} />
                  {bag.status === 'OPEN' ? (
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                      disabled={seal.isPending || bag.orderIds.length === 0}
                      onClick={async () => {
                        try {
                          await seal.mutateAsync(bag.id)
                          toast(`Bag ${bag.bagBarcode} sealed`, 'success')
                        } catch (e) {
                          toast((e as Error).message, 'error')
                        }
                      }}
                    >
                      Seal bag
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                    onClick={() => setExpandedId(expanded ? null : bag.id)}
                  >
                    {expanded ? 'Hide orders' : 'Show orders'}
                  </button>
                </div>
              </div>
              {expanded ? (
                <ul className="divide-y divide-slate-100">
                  {bag.orderIds.map((oid) => {
                    const order = orderMap.get(oid)
                    return (
                      <li key={oid} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <p className="font-semibold">{order?.orderNumber ?? oid}</p>
                          <p className="text-xs text-slate-500">
                            {order?.customerName ?? '—'} · {order?.city ?? '—'}
                          </p>
                        </div>
                        {order ? (
                          <StatusBadge label={order.status} tone="slate" />
                        ) : null}
                      </li>
                    )
                  })}
                  {!bag.orderIds.length ? (
                    <li className="px-4 py-3 text-sm text-slate-500">No orders in this bag yet.</li>
                  ) : null}
                </ul>
              ) : null}
            </section>
          )
        })}
        {!bags.length && !bagsQ.isLoading ? (
          <p className="text-sm text-slate-500">No route bags yet — sort ready orders to create bags.</p>
        ) : null}
      </div>
    </div>
  )
}
