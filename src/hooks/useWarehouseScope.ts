import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWarehouses } from '@/hooks/useWarehouseAdmin'
import { warehouseAdminService } from '@/services/warehouseAdmin.service'

const STORAGE_KEY = 'upbox.warehouseScopeId'

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(id: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}

/** Resolve and sync a single active warehouse for catalog / ops pages. */
export function useWarehouseScope() {
  const [params, setParams] = useSearchParams()
  const whQ = useWarehouses()
  const warehouses = whQ.data ?? []
  const primary = warehouseAdminService.primaryWarehouseId()

  const warehouseId = useMemo(() => {
    const fromUrl = params.get('warehouse')
    if (fromUrl && (!warehouses.length || warehouses.some((w) => w.id === fromUrl))) {
      return fromUrl
    }
    const stored = readStored()
    if (stored && (!warehouses.length || warehouses.some((w) => w.id === stored))) {
      return stored
    }
    return primary
  }, [params, warehouses, primary])

  const warehouse = warehouses.find((w) => w.id === warehouseId) ?? null

  const urlWarehouse = params.get('warehouse')

  useEffect(() => {
    if (!warehouseId) return
    writeStored(warehouseId)
    if (urlWarehouse === warehouseId) return
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('warehouse', warehouseId)
        return next
      },
      { replace: true }
    )
  }, [warehouseId, urlWarehouse, setParams])

  const setWarehouseId = useCallback(
    (id: string) => {
      writeStored(id)
      const next = new URLSearchParams(params)
      next.set('warehouse', id)
      next.delete('zone')
      setParams(next)
    },
    [params, setParams]
  )

  const withWarehouse = useCallback(
    (path: string) => {
      const sep = path.includes('?') ? '&' : '?'
      return `${path}${sep}warehouse=${encodeURIComponent(warehouseId)}`
    },
    [warehouseId]
  )

  return {
    warehouseId,
    warehouse,
    warehouses,
    setWarehouseId,
    withWarehouse,
    isLoading: whQ.isLoading,
  }
}
