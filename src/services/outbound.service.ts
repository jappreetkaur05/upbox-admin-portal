import {
  allocationRules,
  deliveryRoutes,
  feBays,
  feCheckIns,
  feQueue,
  fieldExecutives,
  inFieldShipments,
  outboundActivity,
  outboundOrders,
  packageCatalog,
  packStations,
  pickAssignConfig,
  pickExceptions,
  pickLists,
  PICKERS,
  routeBags,
  shippingLabels,
  waves,
} from '@/data/mockOutbound'
import { upsertFeHandoff } from '@/lib/feHandoff'
import type {
  AllocationRule,
  CourierCode,
  DeliveryRoute,
  FeBay,
  FeCheckIn,
  FeHandoffParcel,
  FeQueueItem,
  FieldExecutive,
  InFieldShipment,
  OutboundActivity,
  OutboundDashboardKpis,
  OutboundFlowSummary,
  OutboundOrder,
  OutboundOrderStatus,
  PackageOption,
  PackStation,
  PickAssignConfig,
  PickException,
  PickList,
  RouteBag,
  ShippingLabel,
  Wave,
  WaveType,
} from '@/types/outbound'

const delay = (ms?: number) => new Promise((r) => setTimeout(r, ms ?? 200 + Math.floor(Math.random() * 200)))

let roundRobinCursor = 0

function clone<T>(v: T): T {
  return structuredClone(v)
}

function pushTimeline(order: OutboundOrder, label: string, detail?: string, actor?: string) {
  order.timeline.unshift({
    id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    label,
    detail,
    actor,
  })
}

function pushActivity(message: string, tone: OutboundActivity['tone'] = 'info') {
  outboundActivity.unshift({
    id: `act-${Date.now()}`,
    at: new Date().toISOString(),
    message,
    tone,
  })
}

function isSlaBreach(order: OutboundOrder) {
  if (['DELIVERED', 'FAILED', 'RETURNED'].includes(order.status)) return false
  return new Date(order.slaCutoffAt).getTime() < Date.now()
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

const LOCATIONS = ['W.A.R1.B1.3', 'W.A.R2.B1.2', 'W.A.R3.B1.1', 'W.B.R1.B2.1', 'W.B.R2.B1.2']

function zoneFromLocation(locationCode: string): string | null {
  const parts = locationCode.split('.')
  return parts[1] ?? null
}

function parseLocationParts(locationCode: string) {
  const parts = locationCode.split('.')
  return {
    rack: parts[2] ?? 'R1',
    shelf: parts[3] ?? 'B1',
    bin: parts[4] ?? '1',
  }
}

function buildStop(orderId: string, line: OutboundOrder['lines'][0], sequence: number): PickList['stops'][0] {
  const loc = line.allocatedLocationCode ?? 'W.A.R1.B1.1'
  const { rack, shelf, bin } = parseLocationParts(loc)
  return {
    id: `stop-${orderId}-${line.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    orderId,
    lineId: line.id,
    sku: line.sku,
    name: line.name,
    barcode: line.barcode,
    qty: line.qty,
    qtyPicked: 0,
    locationCode: loc,
    rack,
    shelf,
    bin,
    sequence,
    done: false,
    outcome: 'open',
  }
}

function openListCountForPicker(pickerId: string) {
  return pickLists.filter(
    (pl) => pl.pickerId === pickerId && (pl.status === 'ASSIGNED' || pl.status === 'IN_PROGRESS')
  ).length
}

function pickPickerForList(pl: PickList): { id: string; name: string } | null {
  const cfg = pickAssignConfig
  const eligible = PICKERS.filter((p) => openListCountForPicker(p.id) < cfg.maxOpenListsPerPicker)

  if (eligible.length === 0) return null

  let chosen: (typeof PICKERS)[0] | undefined

  switch (cfg.strategy) {
    case 'least_open_lists':
      chosen = [...eligible].sort((a, b) => openListCountForPicker(a.id) - openListCountForPicker(b.id))[0]
      break
    case 'round_robin': {
      const start = roundRobinCursor % eligible.length
      chosen = eligible[start]
      roundRobinCursor = (roundRobinCursor + 1) % Math.max(eligible.length, 1)
      break
    }
    case 'zone_match': {
      const zone = pl.zoneHint
      const zonePickers = zone
        ? eligible.filter((p) => p.zones.includes(zone))
        : eligible
      if (zonePickers.length > 0) {
        chosen = zonePickers.sort((a, b) => openListCountForPicker(a.id) - openListCountForPicker(b.id))[0]
      } else if (cfg.preferSameZone && !cfg.fallbackToQueue) {
        return null
      } else {
        chosen = eligible.sort((a, b) => openListCountForPicker(a.id) - openListCountForPicker(b.id))[0]
      }
      break
    }
  }

  return chosen ? { id: chosen.id, name: chosen.name } : null
}

function assignPickList(pl: PickList): PickList {
  if (pl.status !== 'QUEUED' || pl.pickerId) return pl
  const picker = pickPickerForList(pl)
  if (!picker) return pl
  pl.pickerId = picker.id
  pl.pickerName = picker.name
  pl.status = 'ASSIGNED'
  const wave = waves.find((w) => w.id === pl.waveId)
  if (wave && !wave.pickerIds.includes(picker.id)) wave.pickerIds.push(picker.id)
  pushActivity(`${picker.name} assigned pick list ${pl.id}`, 'info')
  return pl
}

function autoAssignQueuedLists(): PickList[] {
  if (!pickAssignConfig.autoAssignEnabled) return []
  const assigned: PickList[] = []
  for (const pl of pickLists) {
    if (pl.status === 'QUEUED' && !pl.pickerId) {
      const before = pl.pickerId
      assignPickList(pl)
      if (pl.pickerId && pl.pickerId !== before) assigned.push(pl)
    }
  }
  return assigned
}

export const outboundService = {
  async getDashboard(): Promise<{ kpis: OutboundDashboardKpis; activity: OutboundActivity[] }> {
    await delay()
    const kpis: OutboundDashboardKpis = {
      ordersWaiting: outboundOrders.filter((o) => o.status === 'OPEN').length,
      ordersAllocated: outboundOrders.filter((o) => o.status === 'ALLOCATED').length,
      picking: outboundOrders.filter((o) => ['WAVED', 'PICKING'].includes(o.status)).length,
      packing: outboundOrders.filter((o) => ['PICKED', 'PACKING'].includes(o.status)).length,
      readyForFe: outboundOrders.filter((o) => o.status === 'READY').length,
      inRouteBags: outboundOrders.filter((o) => o.status === 'IN_ROUTE_BAG').length,
      assignedToFe: outboundOrders.filter((o) => o.status === 'ASSIGNED_TO_FE').length,
      outWithFe: outboundOrders.filter((o) => ['RELEASED_TO_FE', 'LOADED'].includes(o.status)).length,
      deliveredToday: outboundOrders.filter((o) => o.status === 'DELIVERED').length +
        inFieldShipments.filter((s) => s.status === 'DELIVERED' && s.deliveredAt && isToday(s.deliveredAt)).length,
      slaBreaches: outboundOrders.filter(isSlaBreach).length,
      exceptionsOpen: pickExceptions.filter((e) => e.status === 'OPEN' || e.status === 'REPLACING').length,
    }
    return { kpis, activity: clone(outboundActivity) }
  },

  async getOutboundFlowSummary(): Promise<OutboundFlowSummary> {
    await delay(100)
    return {
      openOrders: outboundOrders.filter((o) => o.status === 'OPEN').length,
      toAllocate: outboundOrders.filter((o) => o.status === 'OPEN').length,
      allocated: outboundOrders.filter((o) => o.status === 'ALLOCATED').length,
      draftWaves: waves.filter((w) => w.status === 'DRAFT').length,
      openPickStops: pickLists
        .filter((p) => p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS')
        .reduce((n, p) => n + p.stops.filter((s) => s.outcome === 'open').length, 0),
      openExceptions: pickExceptions.filter((e) => e.status === 'OPEN' || e.status === 'REPLACING').length,
      toPack: outboundOrders.filter((o) => o.status === 'PICKED').length,
      packing: outboundOrders.filter((o) => o.status === 'PACKING').length,
      toLabel: outboundOrders.filter(
        (o) =>
          (o.status === 'PACKED' || o.status === 'READY') &&
          !shippingLabels.some((l) => l.orderId === o.id)
      ).length,
      readyToBag: outboundOrders.filter((o) => o.status === 'READY' && o.routeId).length,
      sealedBags: routeBags.filter((b) => b.status === 'SEALED').length,
      pendingFeCheckIn: feCheckIns.filter((c) => c.status === 'PENDING').length,
      verifiedFes: feCheckIns.filter((c) => c.status === 'VERIFIED').length,
      assignedBags: routeBags.filter((b) => b.status === 'ASSIGNED').length,
      inField: inFieldShipments.filter((s) => s.status !== 'DELIVERED' && s.status !== 'RETURNED').length,
    }
  },

  async listOrders(filters?: { status?: OutboundOrderStatus | 'ALL'; q?: string }): Promise<OutboundOrder[]> {
    await delay()
    let rows = [...outboundOrders]
    if (filters?.status && filters.status !== 'ALL') {
      rows = rows.filter((o) => o.status === filters.status)
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase()
      rows = rows.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.trackingNumber?.toLowerCase().includes(q)
      )
    }
    return clone(rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)))
  },

  async getOrder(id: string): Promise<OutboundOrder | null> {
    await delay(150)
    const o = outboundOrders.find((x) => x.id === id || x.orderNumber === id)
    return o ? clone(o) : null
  },

  async listAllocationRules(): Promise<AllocationRule[]> {
    await delay()
    return clone(allocationRules)
  },

  async autoAllocate(orderIds?: string[]): Promise<OutboundOrder[]> {
    await delay(400)
    const targets = outboundOrders.filter((o) =>
      orderIds?.length ? orderIds.includes(o.id) : o.status === 'OPEN'
    )
    for (const order of targets) {
      order.lines.forEach((l, i) => {
        l.allocatedLocationCode = LOCATIONS[i % LOCATIONS.length]!
        l.allocatedBinId = `bin-${l.allocatedLocationCode}`
        l.qtyAllocated = l.qty
        l.status = 'ALLOCATED'
      })
      order.status = 'ALLOCATED'
      order.courier = order.courier ?? 'UPBOX'
      pushTimeline(order, 'Auto-allocated', allocationRules.find((r) => r.enabled)?.name, 'System')
    }
    pushActivity(`Auto-allocated ${targets.length} order(s)`, 'success')
    return clone(targets)
  },

  async manualAllocate(orderId: string, lineId: string, locationCode: string): Promise<OutboundOrder> {
    await delay()
    const order = outboundOrders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    const line = order.lines.find((l) => l.id === lineId)
    if (!line) throw new Error('Line not found')
    line.allocatedLocationCode = locationCode
    line.allocatedBinId = `bin-${locationCode}`
    line.qtyAllocated = line.qty
    line.status = 'ALLOCATED'
    if (order.lines.every((l) => l.status === 'ALLOCATED' || l.qtyAllocated >= l.qty)) {
      order.status = 'ALLOCATED'
    }
    pushTimeline(order, 'Manual allocation', `${line.sku} → ${locationCode}`)
    return clone(order)
  },

  async listWaves(): Promise<Wave[]> {
    await delay()
    return clone(waves)
  },

  async createWave(input: {
    name: string
    type: WaveType
    orderIds: string[]
    zoneFilter?: string | null
    scheduledAt?: string | null
  }): Promise<Wave> {
    await delay()
    if (!input.orderIds.length) throw new Error('Select at least one allocated order')
    for (const id of input.orderIds) {
      const o = outboundOrders.find((x) => x.id === id)
      if (!o) throw new Error(`Order ${id} not found`)
      if (o.status !== 'ALLOCATED' && o.status !== 'OPEN') {
        throw new Error(`${o.orderNumber} is ${o.status} — only allocated orders can join a wave`)
      }
    }
    const wave: Wave = {
      id: `wave-${Date.now()}`,
      name: input.name,
      type: input.type,
      status: 'DRAFT',
      priority: input.type === 'priority' ? 1 : 5,
      zoneFilter: input.zoneFilter ?? null,
      scheduledAt: input.scheduledAt ?? null,
      releasedAt: null,
      orderIds: input.orderIds,
      pickerIds: [],
      createdAt: new Date().toISOString(),
    }
    waves.unshift(wave)
    for (const id of input.orderIds) {
      const o = outboundOrders.find((x) => x.id === id)
      if (o && ['OPEN', 'ALLOCATED'].includes(o.status)) {
        o.waveId = wave.id
        o.status = 'WAVED'
        pushTimeline(o, 'Added to wave', wave.name)
      }
    }
    return clone(wave)
  },

  async createAndReleaseWave(input: {
    name: string
    type: WaveType
    orderIds: string[]
    zoneFilter?: string | null
    scheduledAt?: string | null
  }): Promise<{ wave: Wave; pickLists: PickList[] }> {
    const wave = await this.createWave(input)
    const released = await this.releaseWave(wave.id)
    const lists = pickLists.filter((p) => p.waveId === released.id)
    // Ensure lists are assigned even if auto-assign was off
    for (const pl of lists) {
      if (!pl.pickerId) assignPickList(pl)
    }
    return { wave: clone(released), pickLists: clone(lists) }
  },

  async releaseWave(waveId: string): Promise<Wave> {
    await delay()
    const wave = waves.find((w) => w.id === waveId)
    if (!wave) throw new Error('Wave not found')
    if (wave.status !== 'DRAFT' && wave.status !== 'RELEASED') {
      throw new Error(`Wave cannot be released from status ${wave.status}`)
    }

    wave.status = 'IN_PROGRESS'
    wave.releasedAt = new Date().toISOString()

    type StopGroup = { zone: string | null; stops: PickList['stops'] }
    const groups = new Map<string, StopGroup>()

    for (const oid of wave.orderIds) {
      const o = outboundOrders.find((x) => x.id === oid)
      if (!o) continue
      o.status = 'PICKING'
      pushTimeline(o, 'Wave released', wave.name)

      for (const l of o.lines) {
        const loc = l.allocatedLocationCode ?? 'W.A.R1.B1.1'
        const zone = pickAssignConfig.splitByZone ? zoneFromLocation(loc) : wave.zoneFilter
        const key = pickAssignConfig.splitByZone ? (zone ?? 'unknown') : '__single__'
        if (!groups.has(key)) groups.set(key, { zone: pickAssignConfig.splitByZone ? zone : wave.zoneFilter, stops: [] })
        const group = groups.get(key)!
        group.stops.push(buildStop(oid, l, group.stops.length + 1))
      }
    }

    const createdLists: PickList[] = []
    for (const [, group] of groups) {
      const pl: PickList = {
        id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        waveId: wave.id,
        pickerId: null,
        pickerName: null,
        status: 'QUEUED',
        routeOptimized: true,
        zoneHint: group.zone ?? wave.zoneFilter,
        stops: group.stops,
        createdAt: new Date().toISOString(),
      }
      pickLists.unshift(pl)
      createdLists.push(pl)

      for (const stop of pl.stops) {
        const o = outboundOrders.find((x) => x.id === stop.orderId)
        if (o) o.pickListId = pl.id
      }
    }

    if (pickAssignConfig.autoAssignEnabled) {
      for (const pl of createdLists) assignPickList(pl)
    }

    pushActivity(`Wave ${wave.name} released — ${createdLists.length} pick list(s) created`, 'success')
    return clone(wave)
  },

  async getPickAssignConfig(): Promise<PickAssignConfig> {
    await delay(150)
    return clone(pickAssignConfig)
  },

  async updatePickAssignConfig(patch: Partial<PickAssignConfig>): Promise<PickAssignConfig> {
    await delay()
    Object.assign(pickAssignConfig, patch)
    if (pickAssignConfig.autoAssignEnabled) autoAssignQueuedLists()
    return clone(pickAssignConfig)
  },

  async autoAssignQueuedLists(): Promise<PickList[]> {
    await delay()
    const assigned = autoAssignQueuedLists()
    return clone(assigned)
  },

  async listPickLists(): Promise<PickList[]> {
    await delay()
    return clone(pickLists)
  },

  async assignPicker(pickListId: string, pickerId: string, pickerName: string): Promise<PickList> {
    await delay()
    const pl = pickLists.find((p) => p.id === pickListId)
    if (!pl) throw new Error('Pick list not found')
    if (openListCountForPicker(pickerId) >= pickAssignConfig.maxOpenListsPerPicker) {
      throw new Error(`Picker already has ${pickAssignConfig.maxOpenListsPerPicker} open lists`)
    }
    pl.pickerId = pickerId
    pl.pickerName = pickerName
    pl.status = 'ASSIGNED'
    const wave = waves.find((w) => w.id === pl.waveId)
    if (wave && !wave.pickerIds.includes(pickerId)) wave.pickerIds.push(pickerId)
    return clone(pl)
  },

  async confirmPickStop(pickListId: string, stopId: string): Promise<PickList> {
    await delay(200)
    const pl = pickLists.find((p) => p.id === pickListId)
    if (!pl) throw new Error('Pick list not found')
    const stop = pl.stops.find((s) => s.id === stopId)
    if (!stop) throw new Error('Stop not found')
    if (stop.outcome !== 'open') {
      throw new Error(
        stop.outcome === 'picked' ? 'Stop already confirmed as picked' : 'Stop already raised as exception'
      )
    }
    stop.qtyPicked = stop.qty
    stop.done = true
    stop.outcome = 'picked'
    pl.status = 'IN_PROGRESS'

    const order = outboundOrders.find((o) => o.id === stop.orderId)
    if (order) {
      const line = order.lines.find((l) => l.id === stop.lineId)
      if (line) {
        line.qtyPicked = line.qty
        line.status = 'PICKED'
      }
      const allPicked = order.lines.every((l) => l.status === 'PICKED')
      const allSettled = order.lines.every((l) => l.status === 'PICKED' || l.status === 'EXCEPTION')
      if (allPicked) {
        order.status = 'PICKED'
        pushTimeline(order, 'Pick complete')
      } else if (allSettled) {
        order.status = 'ON_HOLD'
      } else {
        order.status = 'PICKING'
      }
    }

    if (pl.stops.every((s) => s.outcome !== 'open')) pl.status = 'COMPLETE'
    return clone(pl)
  },

  async listExceptions(): Promise<PickException[]> {
    await delay()
    return clone(pickExceptions)
  },

  async raiseException(input: {
    pickListId: string
    stopId: string
    orderId: string
    orderNumber: string
    lineId: string
    sku: string
    type: PickException['type']
    notes: string
    raisedBy: string
  }): Promise<PickException> {
    await delay()
    const pl = pickLists.find((p) => p.id === input.pickListId)
    if (!pl) throw new Error('Pick list not found')
    const stop = pl.stops.find((s) => s.id === input.stopId)
    if (!stop) throw new Error('Stop not found')
    if (stop.outcome !== 'open') {
      throw new Error(
        stop.outcome === 'picked' ? 'Stop already confirmed as picked' : 'Exception already raised for this product'
      )
    }
    const existing = pickExceptions.find(
      (e) => e.lineId === input.lineId && (e.status === 'OPEN' || e.status === 'REPLACING')
    )
    if (existing) throw new Error('Exception already open for this product line')

    stop.done = true
    stop.outcome = 'excepted'
    pl.status = 'IN_PROGRESS'

    const ex: PickException = {
      id: `ex-${Date.now()}`,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      lineId: input.lineId,
      sku: input.sku,
      type: input.type,
      notes: input.notes,
      raisedBy: input.raisedBy,
      raisedAt: new Date().toISOString(),
      status: 'OPEN',
      replacementSku: null,
    }
    pickExceptions.unshift(ex)

    const order = outboundOrders.find((o) => o.id === input.orderId)
    if (order) {
      order.status = 'ON_HOLD'
      const line = order.lines.find((l) => l.id === input.lineId)
      if (line) line.status = 'EXCEPTION'
      pushTimeline(order, 'Pick exception', input.type, input.raisedBy)
    }

    if (pl.stops.every((s) => s.outcome !== 'open')) pl.status = 'COMPLETE'
    pushActivity(`Exception on ${input.orderNumber} (${input.type})`, 'warn')
    return clone(ex)
  },

  async resolveException(id: string, replacementSku?: string): Promise<PickException> {
    await delay()
    const ex = pickExceptions.find((e) => e.id === id)
    if (!ex) throw new Error('Exception not found')
    if (ex.status === 'RESOLVED' || ex.status === 'CANCELLED') {
      throw new Error('Exception already closed')
    }
    ex.status = 'RESOLVED'
    ex.replacementSku = replacementSku ?? ex.sku

    const order = outboundOrders.find((o) => o.id === ex.orderId)
    if (order) {
      const line = order.lines.find((l) => l.id === ex.lineId)
      if (line) {
        line.status = 'ALLOCATED'
        line.qtyPicked = 0
        if (replacementSku) {
          line.sku = replacementSku
          line.barcode = `BC-${replacementSku}`
        }
      }
      order.status = 'PICKING'
      pushTimeline(order, 'Exception resolved', replacementSku ? `Replacement ${replacementSku}` : undefined)

      // Keep original stop as excepted; append a new open stop so picking can continue
      if (line) {
        let targetList =
          pickLists.find(
            (p) =>
              (p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS') &&
              p.stops.some((s) => s.orderId === order.id && s.lineId === line.id)
          ) ?? pickLists.find((p) => p.status === 'ASSIGNED' || p.status === 'IN_PROGRESS')

        if (targetList) {
          const newStop = buildStop(order.id, line, targetList.stops.length + 1)
          if (replacementSku) {
            newStop.sku = replacementSku
            newStop.barcode = `BC-${replacementSku}`
            newStop.name = line.name
          }
          targetList.stops.push(newStop)
          if (targetList.status === 'COMPLETE') targetList.status = 'IN_PROGRESS'
        }
      }
    }
    return clone(ex)
  },

  async listPackStations(): Promise<PackStation[]> {
    await delay()
    return clone(packStations)
  },

  async recommendPackage(orderId: string): Promise<PackageOption[]> {
    await delay(200)
    const order = outboundOrders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    const totalW = order.lines.reduce((s, l) => s + l.unitWeightKg * l.qty, 0)
    const maxL = Math.max(...order.lines.map((l) => l.lengthCm))
    const maxW = Math.max(...order.lines.map((l) => l.widthCm))
    const maxH = order.lines.reduce((s, l) => s + l.heightCm * l.qty, 0)
    return clone(
      packageCatalog
        .map((p) => ({
          ...p,
          score:
            (p.maxWeightKg >= totalW ? 40 : 0) +
            (p.lengthCm >= maxL && p.widthCm >= maxW && p.heightCm >= maxH ? 40 : 10) +
            (p.type === 'MAILER' && totalW < 1.5 ? 15 : 0) +
            (p.type === 'CARTON' && totalW >= 1.5 ? 15 : 0),
        }))
        .sort((a, b) => b.score - a.score)
    )
  },

  async startPack(stationId: string, orderId: string, operatorId: string): Promise<PackStation> {
    await delay()
    const station = packStations.find((s) => s.id === stationId)
    const order = outboundOrders.find((o) => o.id === orderId)
    if (!station || !order) throw new Error('Station or order not found')
    if (order.status !== 'PICKED' && order.status !== 'PACKING') {
      throw new Error(`Order must be picked before packing (current: ${order.status})`)
    }

    if (station.status === 'OFFLINE') {
      throw new Error(`Station ${station.name} is offline`)
    }
    if (station.status === 'BUSY' && station.activeOrderId && station.activeOrderId !== orderId) {
      throw new Error(`Station ${station.name} is busy with another order`)
    }
    if (order.status === 'PACKING' && order.packStationId && order.packStationId !== stationId) {
      const other = packStations.find((s) => s.id === order.packStationId)
      throw new Error(
        `Order ${order.orderNumber} is already packing at ${other?.name ?? order.packStationId}`
      )
    }
    if (order.packStationId && order.packStationId !== stationId && order.status === 'PACKING') {
      throw new Error(
        `Order ${order.orderNumber} is assigned to station ${order.packStationId}; clear or finish there first`
      )
    }

    station.activeOrderId = orderId
    station.operatorId = operatorId
    station.status = 'BUSY'
    order.packStationId = stationId
    order.status = 'PACKING'
    pushTimeline(order, 'Packing started', station.name)
    return clone(station)
  },

  async validatePack(
    orderId: string,
    input: {
      packageType: string
      weightKg: number
      lengthCm: number
      widthCm: number
      heightCm: number
    }
  ): Promise<{ order: OutboundOrder; weightOk: boolean; dimsOk: boolean }> {
    await delay()
    const order = outboundOrders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    const expectedW = order.lines.reduce((s, l) => s + l.unitWeightKg * l.qty, 0)
    const weightOk = Math.abs(input.weightKg - expectedW) <= expectedW * 0.25 + 0.15
    const maxL = Math.max(...order.lines.map((l) => l.lengthCm))
    const maxWd = Math.max(...order.lines.map((l) => l.widthCm))
    const dimsOk = input.lengthCm >= maxL * 0.8 && input.widthCm >= maxWd * 0.8 && input.heightCm > 0

    order.packageType = input.packageType
    order.actualWeightKg = input.weightKg
    order.actualLengthCm = input.lengthCm
    order.actualWidthCm = input.widthCm
    order.actualHeightCm = input.heightCm
    order.weightValidated = weightOk
    order.dimsValidated = dimsOk
    order.qcPassed = weightOk && dimsOk

    if (weightOk && dimsOk) {
      order.lines.forEach((l) => {
        l.qtyPacked = l.qty
        l.status = 'PACKED'
      })
      order.status = 'PACKED'
      pushTimeline(order, 'Weight & dims validated', `${input.weightKg} kg`)
    } else {
      pushTimeline(order, 'Validation failed', !weightOk ? 'Weight mismatch' : 'Dimension mismatch')
    }
    return { order: clone(order), weightOk, dimsOk }
  },

  async completePack(orderId: string): Promise<OutboundOrder> {
    await delay()
    const order = outboundOrders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    if (!order.weightValidated || !order.dimsValidated) {
      throw new Error('Validate weight & dimensions first')
    }
    order.status = 'READY'
    order.qcPassed = true
    pushTimeline(order, 'QC passed — ready for route bag')

    const station = packStations.find((s) => s.activeOrderId === orderId)
    if (station) {
      station.activeOrderId = null
      station.operatorId = null
      station.status = 'IDLE'
    }
    pushActivity(`${order.orderNumber} ready for route bag`, 'info')
    return clone(order)
  },

  async listLabels(): Promise<ShippingLabel[]> {
    await delay()
    return clone(shippingLabels)
  },

  async generateLabel(orderId: string, courier: CourierCode = 'UPBOX'): Promise<ShippingLabel> {
    await delay(350)
    const order = outboundOrders.find((o) => o.id === orderId)
    if (!order) throw new Error('Order not found')
    if (!['PACKED', 'READY', 'IN_ROUTE_BAG', 'ASSIGNED_TO_FE', 'RELEASED_TO_FE'].includes(order.status)) {
      throw new Error(`Generate label after packing QC (current: ${order.status})`)
    }
    const tracking = `UBX${Math.floor(Math.random() * 1e10)
      .toString()
      .padStart(10, '0')}`
    order.courier = courier
    order.trackingNumber = tracking

    const existing = shippingLabels.find((l) => l.orderId === orderId)
    if (existing) {
      existing.trackingNumber = tracking
      existing.barcode = `*${tracking}*`
      existing.qrPayload = `https://track.upbox.test/${tracking}`
      existing.courier = courier
      pushTimeline(order, 'Shipping label regenerated', tracking)
      return clone(existing)
    }

    const label: ShippingLabel = {
      id: `lbl-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: tracking,
      barcode: `*${tracking}*`,
      qrPayload: `https://track.upbox.test/${tracking}`,
      courier,
      printedAt: null,
      printCount: 0,
      labelUrl: '#',
    }
    shippingLabels.unshift(label)
    pushTimeline(order, 'Shipping label generated', tracking)
    return clone(label)
  },

  async printLabel(labelId: string): Promise<ShippingLabel> {
    await delay(250)
    const label = shippingLabels.find((l) => l.id === labelId)
    if (!label) throw new Error('Label not found')
    label.printCount += 1
    label.printedAt = new Date().toISOString()
    pushActivity(`Label printed for ${label.orderNumber} (${label.printCount}x)`, 'info')
    return clone(label)
  },

  async listDeliveryRoutes(): Promise<DeliveryRoute[]> {
    await delay()
    return clone(deliveryRoutes)
  },

  async listRouteBags(): Promise<RouteBag[]> {
    await delay()
    return clone(routeBags)
  },

  async sortReadyIntoRouteBags(): Promise<RouteBag[]> {
    await delay(350)
    const ready = outboundOrders.filter((o) => o.status === 'READY' && o.routeId)
    const byRoute = new Map<string, OutboundOrder[]>()
    for (const o of ready) {
      const list = byRoute.get(o.routeId!) ?? []
      list.push(o)
      byRoute.set(o.routeId!, list)
    }

    const created: RouteBag[] = []
    for (const [routeId, orders] of byRoute) {
      const route = deliveryRoutes.find((r) => r.id === routeId)
      if (!route) continue

      let bag = routeBags.find((b) => b.routeId === routeId && b.status === 'OPEN')
      if (!bag) {
        bag = {
          id: `bag-${routeId}-${Date.now()}`,
          routeId,
          routeCode: route.code,
          routeName: route.name,
          bagBarcode: `BAG-${route.code.replace('RT-', '')}-${Date.now().toString().slice(-4)}`,
          orderIds: [],
          status: 'OPEN',
          feId: null,
          feName: null,
          feBayId: null,
          sealedAt: null,
          assignedAt: null,
          createdAt: new Date().toISOString(),
        }
        routeBags.unshift(bag)
        created.push(bag)
      }

      for (const o of orders) {
        if (!bag.orderIds.includes(o.id)) bag.orderIds.push(o.id)
        o.bagId = bag.id
        o.status = 'IN_ROUTE_BAG'
        pushTimeline(o, 'Sorted into route bag', bag.bagBarcode)
      }

      bag.status = 'SEALED'
      bag.sealedAt = new Date().toISOString()
    }

    if (created.length > 0) {
      pushActivity(`Sorted ${ready.length} ready order(s) into ${created.length} route bag(s)`, 'success')
    }
    return clone(created.length > 0 ? created : routeBags.filter((b) => b.sealedAt))
  },

  async sealRouteBag(bagId: string): Promise<RouteBag> {
    await delay()
    const bag = routeBags.find((b) => b.id === bagId)
    if (!bag) throw new Error('Route bag not found')
    bag.status = 'SEALED'
    bag.sealedAt = new Date().toISOString()
    pushActivity(`Route bag ${bag.bagBarcode} sealed — ${bag.orderIds.length} orders`, 'success')
    return clone(bag)
  },

  async moveOrderToBag(orderId: string, bagId: string): Promise<RouteBag> {
    await delay()
    const order = outboundOrders.find((o) => o.id === orderId)
    const bag = routeBags.find((b) => b.id === bagId)
    if (!order || !bag) throw new Error('Order or bag not found')
    if (order.routeId && order.routeId !== bag.routeId) {
      throw new Error(`Order route ${order.routeId} does not match bag route ${bag.routeId}`)
    }

    if (order.bagId && order.bagId !== bagId) {
      const prev = routeBags.find((b) => b.id === order.bagId)
      if (prev) prev.orderIds = prev.orderIds.filter((id) => id !== orderId)
    }

    if (!bag.orderIds.includes(orderId)) bag.orderIds.push(orderId)
    order.bagId = bagId
    order.status = 'IN_ROUTE_BAG'
    pushTimeline(order, 'Moved to route bag', bag.bagBarcode)
    return clone(bag)
  },

  async listFieldExecutives(): Promise<FieldExecutive[]> {
    await delay()
    return clone(fieldExecutives)
  },

  async assignBagToFe(bagId: string, feId: string, feBayId?: string): Promise<RouteBag> {
    await delay(350)
    const bag = routeBags.find((b) => b.id === bagId)
    const fe = fieldExecutives.find((f) => f.id === feId)
    if (!bag || !fe) throw new Error('Bag or field executive not found')
    if (bag.status !== 'SEALED') {
      throw new Error(`Bag must be sealed before FE assignment (current: ${bag.status})`)
    }
    const verified = feCheckIns.find((c) => c.feId === feId && c.status === 'VERIFIED')
    if (!verified) {
      throw new Error('FE must check in and be verified before receiving a bag')
    }

    bag.feId = feId
    bag.feName = fe.name
    bag.status = 'ASSIGNED'
    bag.assignedAt = new Date().toISOString()

    if (feBayId) {
      const bay = feBays.find((b) => b.id === feBayId)
      if (!bay) throw new Error('Bay not found')
      if (bay.status !== 'FREE' && bay.feId !== feId) {
        throw new Error(`Bay ${bay.code} is not free`)
      }
      bay.feId = feId
      bay.status = 'LOADING'
      if (!bay.bagIds.includes(bagId)) bay.bagIds.push(bagId)
      bag.feBayId = feBayId
    }

    const handoffParcels: FeHandoffParcel[] = []
    const now = new Date().toISOString()

    for (const oid of bag.orderIds) {
      const order = outboundOrders.find((o) => o.id === oid)
      if (!order) continue
      order.feId = feId
      order.status = 'ASSIGNED_TO_FE'
      if (feBayId) order.feBayId = feBayId
      pushTimeline(order, 'Assigned to FE', fe.name)

      handoffParcels.push({
        parcelId: order.id,
        orderNumber: order.orderNumber,
        feId: fe.id,
        feName: fe.name,
        routeCode: bag.routeCode,
        bagBarcode: bag.bagBarcode,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        address: order.address,
        city: order.city,
        pincode: order.pincode,
        trackingNumber: order.trackingNumber ?? '',
        barcode: order.trackingNumber ? `*${order.trackingNumber}*` : `*${order.orderNumber}*`,
        valueInr: order.valueInr,
        assignedAt: now,
      })
    }

    fe.openParcelCount += bag.orderIds.length
    upsertFeHandoff(handoffParcels)
    pushActivity(`FE ${fe.name} assigned bag ${bag.bagBarcode}`, 'success')
    return clone(bag)
  },

  async releaseBagToFe(bagId: string, feBayId?: string): Promise<RouteBag> {
    await delay(350)
    const bag = routeBags.find((b) => b.id === bagId)
    if (!bag) throw new Error('Route bag not found')
    if (bag.status !== 'ASSIGNED') throw new Error('Only assigned bags can be released')
    if (!bag.feId) throw new Error('Bag must be assigned to an FE before release')

    const verified = feCheckIns.find((c) => c.feId === bag.feId && c.status === 'VERIFIED')
    if (!verified) {
      throw new Error('FE must still be verified before release')
    }

    const bayId = feBayId ?? bag.feBayId ?? undefined
    const fe = fieldExecutives.find((f) => f.id === bag.feId)
    bag.status = 'RELEASED'
    if (bayId) bag.feBayId = bayId

    const releasedAt = new Date().toISOString()

    for (const oid of bag.orderIds) {
      const order = outboundOrders.find((o) => o.id === oid)
      if (!order) continue
      order.status = 'RELEASED_TO_FE'
      if (bayId) order.feBayId = bayId
      pushTimeline(order, 'Released to FE', fe?.name)

      const existing = inFieldShipments.find((s) => s.orderId === oid)
      if (existing) {
        existing.status = 'ASSIGNED'
        existing.releasedAt = releasedAt
        existing.feId = bag.feId!
        existing.feName = bag.feName ?? fe?.name ?? ''
        existing.routeCode = bag.routeCode
      } else {
        inFieldShipments.unshift({
          id: `ifs-${Date.now()}-${oid}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber ?? order.orderNumber,
          feId: bag.feId!,
          feName: bag.feName ?? fe?.name ?? '',
          routeCode: bag.routeCode,
          status: 'ASSIGNED',
          releasedAt,
          deliveredAt: null,
          city: order.city,
          customerPhone: order.customerPhone,
          valueInr: order.valueInr,
        })
      }
    }

    if (bayId) {
      const bay = feBays.find((b) => b.id === bayId)
      if (bay) {
        bay.feId = bag.feId
        if (!bay.bagIds.includes(bagId)) bay.bagIds.push(bagId)
        bay.status = 'LOADING'
      }
    }

    const queueItem = feQueue.find((q) => q.feId === bag.feId)
    if (queueItem) {
      queueItem.status = 'OUT_FOR_DELIVERY'
      queueItem.bagCount += 1
      queueItem.parcelCount += bag.orderIds.length
      queueItem.loadedParcels += bag.orderIds.length
      if (bayId) queueItem.bayId = bayId
    }

    pushActivity(`Bag ${bag.bagBarcode} released to ${bag.feName}`, 'success')
    return clone(bag)
  },

  async listFeBays(): Promise<FeBay[]> {
    await delay()
    return clone(feBays)
  },

  async allocateFeBay(feId: string, bayId: string): Promise<FeBay> {
    await delay()
    const bay = feBays.find((b) => b.id === bayId)
    const fe = fieldExecutives.find((f) => f.id === feId)
    if (!bay || !fe) throw new Error('Bay or field executive not found')
    if (bay.status !== 'FREE') throw new Error(`Bay ${bay.code} is not free (${bay.status})`)

    bay.status = 'RESERVED'
    bay.feId = feId
    bay.utilizationPct = 0

    const queueItem = feQueue.find((q) => q.feId === feId)
    if (queueItem) {
      queueItem.bayId = bayId
      queueItem.status = 'LOADING'
    }

    const checkIn = feCheckIns.find((c) => c.feId === feId)
    if (checkIn && checkIn.status === 'VERIFIED') {
      checkIn.status = 'VERIFIED'
    }

    pushActivity(`FE ${fe.name} allocated to ${bay.name}`, 'info')
    return clone(bay)
  },

  async listFeQueue(): Promise<FeQueueItem[]> {
    await delay()
    return clone(feQueue)
  },

  async listFeCheckIns(): Promise<FeCheckIn[]> {
    await delay()
    return clone(feCheckIns)
  },

  async verifyFe(id: string, otp: string): Promise<FeCheckIn> {
    await delay(300)
    const checkIn = feCheckIns.find((c) => c.id === id)
    if (!checkIn) throw new Error('Check-in not found')
    if (otp !== '123456') throw new Error('Invalid OTP — use 123456 for demo')
    checkIn.otpVerified = true
    checkIn.status = 'VERIFIED'
    checkIn.verifiedAt = new Date().toISOString()

    const queueItem = feQueue.find((q) => q.feId === checkIn.feId)
    if (queueItem) queueItem.status = 'CHECKED_IN'

    const fe = fieldExecutives.find((f) => f.id === checkIn.feId)
    if (fe) fe.status = 'online'

    return clone(checkIn)
  },

  async listInFieldShipments(): Promise<InFieldShipment[]> {
    await delay()
    return clone(inFieldShipments)
  },
}
