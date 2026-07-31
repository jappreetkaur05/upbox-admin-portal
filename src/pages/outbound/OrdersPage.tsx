import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, SideDrawer, StatusBadge, StatusTimeline, orderStatusTone } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import { useAutoAllocate, useOutboundOrders } from '@/hooks/useOutbound'
import { ORDER_STATUS_LABELS, type OutboundOrder, type OutboundOrderStatus } from '@/types/outbound'
import { formatMoney } from '@/lib/cn'
import { useToastStore } from '@/store/useToastStore'

const TERMINAL_STATUSES: OutboundOrderStatus[] = ['DELIVERED', 'FAILED', 'RETURNED', 'DISPATCHED', 'IN_TRANSIT']

export function OrdersPage() {
  const [params] = useSearchParams()
  const initialStatus = (params.get('status') as OutboundOrderStatus | null) ?? 'ALL'
  const [status, setStatus] = useState<OutboundOrderStatus | 'ALL'>(initialStatus === null ? 'ALL' : initialStatus)
  const [selected, setSelected] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const { data = [], isLoading, isError } = useOutboundOrders({ status })
  const autoAlloc = useAutoAllocate()
  const toast = useToastStore((s) => s.push)
  const active = data.find((o) => o.id === activeId) ?? null

  const columns: DataColumn<OutboundOrder>[] = useMemo(
    () => [
      {
        id: 'order',
        header: 'Order',
        sortValue: (r) => r.orderNumber,
        accessor: (r) => (
          <div>
            <p className="font-semibold text-slate-900">{r.orderNumber}</p>
            <p className="text-xs text-slate-500">{r.channel}</p>
          </div>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        sortValue: (r) => r.customerName,
        accessor: (r) => (
          <div>
            <p>{r.customerName}</p>
            <p className="text-xs text-slate-500">
              {r.city}, {r.state}
            </p>
          </div>
        ),
      },
      {
        id: 'phone',
        header: 'Phone',
        sortValue: (r) => r.customerPhone,
        accessor: (r) => <span className="font-mono text-xs">{r.customerPhone}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        sortValue: (r) => r.status,
        accessor: (r) => <StatusBadge label={ORDER_STATUS_LABELS[r.status]} tone={orderStatusTone(r.status)} />,
      },
      {
        id: 'priority',
        header: 'Priority',
        sortValue: (r) => r.priority,
        accessor: (r) => (
          <StatusBadge
            label={r.priority}
            tone={r.priority === 'URGENT' || r.priority === 'HIGH' ? 'amber' : 'slate'}
          />
        ),
      },
      {
        id: 'sla',
        header: 'SLA cutoff',
        sortValue: (r) => +new Date(r.slaCutoffAt),
        accessor: (r) => {
          const late = new Date(r.slaCutoffAt) < new Date() && !TERMINAL_STATUSES.includes(r.status)
          return (
            <span className={late ? 'font-semibold text-red-600' : ''}>
              {new Date(r.slaCutoffAt).toLocaleString()}
            </span>
          )
        },
      },
      {
        id: 'value',
        header: 'Value',
        sortValue: (r) => r.valueInr,
        accessor: (r) => formatMoney(r.valueInr),
      },
      {
        id: 'lines',
        header: 'Lines',
        sortValue: (r) => r.lines.length,
        accessor: (r) => r.lines.length,
      },
    ],
    []
  )

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Orders' }]} />
      <PageHeader
        title="Outbound orders"
        description="Enterprise order board with SLA tracking, bulk allocation, and detail timelines."
        actions={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OutboundOrderStatus | 'ALL')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        }
      />

      <OutboundChrome
        what="Browse outbound orders and bulk-allocate open ones."
        doNow="Filter by status, open a row for timeline, or allocate selected OPEN orders."
        nextLabel="Next: Allocation"
        nextTo="/outbound/allocation"
      >
      <DataTable
        rows={data}
        columns={columns}
        loading={isLoading}
        error={isError ? 'Could not load orders' : null}
        searchPlaceholder="Search order, customer, phone, city, tracking…"
        searchFn={(row, q) =>
          row.orderNumber.toLowerCase().includes(q) ||
          row.customerName.toLowerCase().includes(q) ||
          row.customerPhone.includes(q) ||
          row.city.toLowerCase().includes(q) ||
          (row.trackingNumber?.toLowerCase().includes(q) ?? false)
        }
        selectedIds={selected}
        onToggleSelect={(id) =>
          setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
        }
        onToggleSelectAll={(ids) =>
          setSelected((s) => (ids.every((id) => s.includes(id)) ? s.filter((id) => !ids.includes(id)) : [...new Set([...s, ...ids])]))
        }
        onRowClick={(r) => setActiveId(r.id)}
        bulkActions={
          <button
            type="button"
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white"
            onClick={async () => {
              try {
                await autoAlloc.mutateAsync(selected)
                toast(`Allocated ${selected.length} order(s)`, 'success')
                setSelected([])
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Auto-allocate selected
          </button>
        }
      />

      <SideDrawer open={!!active} title={active?.orderNumber ?? 'Order'} onClose={() => setActiveId(null)}>
        {active ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Customer</p>
                <p className="font-medium">{active.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium font-mono">{active.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <StatusBadge label={ORDER_STATUS_LABELS[active.status]} tone={orderStatusTone(active.status)} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Destination</p>
                <p className="font-medium">
                  {active.city}, {active.pincode}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Value</p>
                <p className="font-medium">{formatMoney(active.valueInr)}</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Lines</h3>
              <ul className="space-y-2">
                {active.lines.map((l) => (
                  <li key={l.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{l.name}</span>
                      <span>×{l.qty}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {l.sku} · {l.allocatedLocationCode ?? 'Unallocated'} · {l.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Status timeline</h3>
              <StatusTimeline events={active.timeline} />
            </div>
          </div>
        ) : null}
      </SideDrawer>
      </OutboundChrome>
    </div>
  )
}
