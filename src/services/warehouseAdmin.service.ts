import {
  seedZonesForWarehouse,
  warehouseAisles,
  warehouseRacks,
  warehouses,
  warehouseZones,
  type CreateWarehouseInput,
} from '@/data/mockWarehouses'
import type {
  WarehouseAisleRecord,
  WarehouseRackRecord,
  WarehouseRecord,
  WarehouseZoneRecord,
  ZonePurpose,
} from '@/types/warehouseAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

export const warehouseAdminService = {
  async listWarehouses(): Promise<WarehouseRecord[]> {
    await delay()
    return [...warehouses]
  },

  async getWarehouse(id: string): Promise<WarehouseRecord | null> {
    await delay(50)
    return warehouses.find((w) => w.id === id) ?? null
  },

  async createWarehouse(input: CreateWarehouseInput): Promise<WarehouseRecord> {
    await delay(180)
    const code = input.code.trim().toUpperCase()
    if (!input.name.trim()) throw new Error('Name is required')
    if (!code) throw new Error('Code is required')
    if (!input.address.trim() || !input.city.trim()) throw new Error('Address and city are required')
    if (warehouses.some((w) => w.code.toUpperCase() === code)) {
      throw new Error('Warehouse code must be unique')
    }
    const id = `wh-${Date.now()}`
    const record: WarehouseRecord = {
      id,
      code,
      name: input.name.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      timezone: input.timezone.trim() || 'Asia/Kolkata',
      operatingHours: input.operatingHours.trim() || '08:00 – 20:00',
      status: 'active',
      notes: input.notes?.trim() || undefined,
      capacityPercent: 0,
      updatedAt: new Date().toISOString(),
    }
    warehouses.push(record)
    warehouseZones.push(...seedZonesForWarehouse(id))
    return { ...record }
  },

  async listZones(warehouseId?: string): Promise<WarehouseZoneRecord[]> {
    await delay()
    const list = warehouseId
      ? warehouseZones.filter((z) => z.warehouseId === warehouseId)
      : [...warehouseZones]
    return list
  },

  async upsertZone(
    partial: Omit<WarehouseZoneRecord, 'id'> & { id?: string }
  ): Promise<WarehouseZoneRecord> {
    await delay(120)
    if (partial.id) {
      const i = warehouseZones.findIndex((z) => z.id === partial.id)
      if (i < 0) throw new Error('Zone not found')
      warehouseZones[i] = { ...warehouseZones[i], ...partial, id: partial.id }
      return { ...warehouseZones[i] }
    }
    const row: WarehouseZoneRecord = {
      ...partial,
      id: `wz-${Date.now()}`,
    }
    warehouseZones.push(row)
    return { ...row }
  },

  async listAisles(warehouseId?: string): Promise<WarehouseAisleRecord[]> {
    await delay()
    return warehouseId
      ? warehouseAisles.filter((a) => a.warehouseId === warehouseId)
      : [...warehouseAisles]
  },

  async listRacks(warehouseId?: string): Promise<WarehouseRackRecord[]> {
    await delay()
    return warehouseId
      ? warehouseRacks.filter((r) => r.warehouseId === warehouseId)
      : [...warehouseRacks]
  },

  warehouseName(id: string): string {
    return warehouses.find((w) => w.id === id)?.name ?? id
  },

  zoneName(id: string): string {
    return warehouseZones.find((z) => z.id === id)?.name ?? id
  },

  zonePurpose(id: string): ZonePurpose | undefined {
    return warehouseZones.find((z) => z.id === id)?.purpose
  },

  primaryWarehouseId(): string {
    return warehouses.find((w) => w.isPrimary)?.id ?? warehouses[0]?.id ?? 'wh-main'
  },
}
