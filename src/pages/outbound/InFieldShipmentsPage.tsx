import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import { useInFieldShipments } from '@/hooks/useOutbound'
import { formatMoney } from '@/lib/cn'
import type { InFieldShipment } from '@/types/outbound'

const STATUS_LABELS: Record<InFieldShipment['status'], string> = {
  ASSIGNED: 'Assigned to FE',
  LOADED: 'Loaded by FE',
  DELIVERED: 'Delivered',
  FAILED: 'Failed delivery',
  RETURNED: 'Returned',
}

function statusTone(status: InFieldShipment['status']) {
  if (status === 'DELIVERED') return 'green' as const
  if (status === 'LOADED') return 'violet' as const
  if (status === 'ASSIGNED') return 'blue' as const
  return 'red' as const
}

export function InFieldShipmentsPage() {
  const q = useInFieldShipments()
  const [filter, setFilter] = useState<'ALL' | InFieldShipment['status']>('ALL')

  const rows = useMemo(
    () => (filter === 'ALL' ? q.data ?? [] : (q.data ?? []).filter((s) => s.status === filter)),
    [q.data, filter]
  )

  const columns: DataColumn<InFieldShipment>[] = [
    { id: 'order', header: 'Order', sortValue: (r) => r.orderNumber, accessor: (r) => <span className="font-semibold">{r.orderNumber}</span> },
    { id: 'track', header: 'Tracking', sortValue: (r) => r.trackingNumber, accessor: (r) => <span className="font-mono text-xs">{r.trackingNumber}</span> },
    { id: 'fe', header: 'Field executive', sortValue: (r) => r.feName, accessor: (r) => r.feName },
    { id: 'route', header: 'Route', sortValue: (r) => r.routeCode, accessor: (r) => <span className="font-mono text-xs">{r.routeCode}</span> },
    {
      id: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      accessor: (r) => <StatusBadge label={STATUS_LABELS[r.status]} tone={statusTone(r.status)} />,
    },
    { id: 'phone', header: 'Customer phone', sortValue: (r) => r.customerPhone, accessor: (r) => <span className="font-mono text-xs">{r.customerPhone}</span> },
    { id: 'city', header: 'City', sortValue: (r) => r.city, accessor: (r) => r.city },
    {
      id: 'released',
      header: 'Released',
      sortValue: (r) => +new Date(r.releasedAt),
      accessor: (r) => new Date(r.releasedAt).toLocaleString(),
    },
    {
      id: 'delivered',
      header: 'Delivered',
      sortValue: (r) => (r.deliveredAt ? +new Date(r.deliveredAt) : 0),
      accessor: (r) => (r.deliveredAt ? new Date(r.deliveredAt).toLocaleString() : '—'),
    },
    { id: 'value', header: 'Value', sortValue: (r) => r.valueInr, accessor: (r) => formatMoney(r.valueInr) },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'In-field shipments' }]} />
      <PageHeader
        title="In-field shipments"
        description="Track parcels already released to field executives."
        actions={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All FE statuses</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="LOADED">Loaded</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="RETURNED">Returned</option>
          </select>
        }
      />
      <OutboundChrome
        what="Monitor last-mile status after release."
        doNow="Filter by status to see what’s still out with FEs."
      >
      <DataTable
        rows={rows}
        columns={columns}
        loading={q.isLoading}
        searchPlaceholder="Search order, FE, route, phone…"
        searchFn={(row, q) =>
          row.orderNumber.toLowerCase().includes(q) ||
          row.feName.toLowerCase().includes(q) ||
          row.routeCode.toLowerCase().includes(q) ||
          row.customerPhone.includes(q) ||
          row.trackingNumber.toLowerCase().includes(q)
        }
      />
      </OutboundChrome>
    </div>
  )
}
