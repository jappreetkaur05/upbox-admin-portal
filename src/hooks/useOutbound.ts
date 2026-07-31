import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { outboundService } from '@/services/outbound.service'
import type { CourierCode, OutboundOrderStatus, PickAssignConfig, PickException, WaveType } from '@/types/outbound'

const keys = {
  all: ['outbound'] as const,
  dashboard: () => [...keys.all, 'dashboard'] as const,
  orders: (f?: string) => [...keys.all, 'orders', f ?? ''] as const,
  order: (id: string) => [...keys.all, 'order', id] as const,
  rules: () => [...keys.all, 'rules'] as const,
  waves: () => [...keys.all, 'waves'] as const,
  pickConfig: () => [...keys.all, 'pickConfig'] as const,
  pickLists: () => [...keys.all, 'pickLists'] as const,
  exceptions: () => [...keys.all, 'exceptions'] as const,
  stations: () => [...keys.all, 'stations'] as const,
  labels: () => [...keys.all, 'labels'] as const,
  routes: () => [...keys.all, 'routes'] as const,
  bags: () => [...keys.all, 'bags'] as const,
  fes: () => [...keys.all, 'fes'] as const,
  bays: () => [...keys.all, 'bays'] as const,
  feQueue: () => [...keys.all, 'feQueue'] as const,
  feCheckIns: () => [...keys.all, 'feCheckIns'] as const,
  inField: () => [...keys.all, 'inField'] as const,
}

function invalidateOutbound(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: keys.all })
}

export function useOutboundDashboard() {
  return useQuery({ queryKey: keys.dashboard(), queryFn: () => outboundService.getDashboard(), refetchInterval: 5000 })
}

export function useOutboundOrders(filters?: { status?: OutboundOrderStatus | 'ALL'; q?: string }) {
  return useQuery({
    queryKey: keys.orders(`${filters?.status ?? 'ALL'}:${filters?.q ?? ''}`),
    queryFn: () => outboundService.listOrders(filters),
  })
}

export function useOutboundOrder(id: string | null) {
  return useQuery({
    queryKey: keys.order(id ?? ''),
    queryFn: () => outboundService.getOrder(id!),
    enabled: !!id,
  })
}

export function useAllocationRules() {
  return useQuery({ queryKey: keys.rules(), queryFn: () => outboundService.listAllocationRules() })
}

export function useAutoAllocate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids?: string[]) => outboundService.autoAllocate(ids),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useManualAllocate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { orderId: string; lineId: string; locationCode: string }) =>
      outboundService.manualAllocate(p.orderId, p.lineId, p.locationCode),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useWaves() {
  return useQuery({ queryKey: keys.waves(), queryFn: () => outboundService.listWaves() })
}

export function useCreateWave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      name: string
      type: WaveType
      orderIds: string[]
      zoneFilter?: string | null
      scheduledAt?: string | null
    }) => outboundService.createWave(input),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useCreateAndReleaseWave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      name: string
      type: WaveType
      orderIds: string[]
      zoneFilter?: string | null
      scheduledAt?: string | null
    }) => outboundService.createAndReleaseWave(input),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useReleaseWave() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (waveId: string) => outboundService.releaseWave(waveId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useOutboundFlowSummary() {
  return useQuery({
    queryKey: [...keys.all, 'flowSummary'],
    queryFn: () => outboundService.getOutboundFlowSummary(),
    refetchInterval: 4000,
  })
}

export function usePickAssignConfig() {
  return useQuery({ queryKey: keys.pickConfig(), queryFn: () => outboundService.getPickAssignConfig() })
}

export function useUpdatePickAssignConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<PickAssignConfig>) => outboundService.updatePickAssignConfig(patch),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useAutoAssignQueuedLists() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => outboundService.autoAssignQueuedLists(),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function usePickLists() {
  return useQuery({ queryKey: keys.pickLists(), queryFn: () => outboundService.listPickLists(), refetchInterval: 4000 })
}

export function useAssignPicker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { pickListId: string; pickerId: string; pickerName: string }) =>
      outboundService.assignPicker(p.pickListId, p.pickerId, p.pickerName),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useConfirmPickStop() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { pickListId: string; stopId: string }) =>
      outboundService.confirmPickStop(p.pickListId, p.stopId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function usePickExceptions() {
  return useQuery({ queryKey: keys.exceptions(), queryFn: () => outboundService.listExceptions() })
}

export function useRaiseException() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: {
      pickListId: string
      stopId: string
      orderId: string
      orderNumber: string
      lineId: string
      sku: string
      type: PickException['type']
      notes: string
      raisedBy: string
    }) => outboundService.raiseException(p),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useResolveException() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { id: string; replacementSku?: string }) =>
      outboundService.resolveException(p.id, p.replacementSku),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function usePackStations() {
  return useQuery({ queryKey: keys.stations(), queryFn: () => outboundService.listPackStations() })
}

export function useRecommendPackage(orderId: string | null) {
  return useQuery({
    queryKey: [...keys.all, 'recommend', orderId],
    queryFn: () => outboundService.recommendPackage(orderId!),
    enabled: !!orderId,
  })
}

export function useStartPack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { stationId: string; orderId: string; operatorId: string }) =>
      outboundService.startPack(p.stationId, p.orderId, p.operatorId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useValidatePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: {
      orderId: string
      packageType: string
      weightKg: number
      lengthCm: number
      widthCm: number
      heightCm: number
    }) => outboundService.validatePack(p.orderId, p),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useCompletePack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => outboundService.completePack(orderId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useShippingLabels() {
  return useQuery({ queryKey: keys.labels(), queryFn: () => outboundService.listLabels() })
}

export function useGenerateLabel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { orderId: string; courier?: CourierCode }) =>
      outboundService.generateLabel(p.orderId, p.courier ?? 'UPBOX'),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function usePrintLabel() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (labelId: string) => outboundService.printLabel(labelId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useDeliveryRoutes() {
  return useQuery({ queryKey: keys.routes(), queryFn: () => outboundService.listDeliveryRoutes() })
}

export function useRouteBags() {
  return useQuery({ queryKey: keys.bags(), queryFn: () => outboundService.listRouteBags(), refetchInterval: 4000 })
}

export function useSortReadyIntoRouteBags() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => outboundService.sortReadyIntoRouteBags(),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useSealRouteBag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bagId: string) => outboundService.sealRouteBag(bagId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useFieldExecutives() {
  return useQuery({ queryKey: keys.fes(), queryFn: () => outboundService.listFieldExecutives() })
}

export function useAssignBagToFe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { bagId: string; feId: string; feBayId?: string }) =>
      outboundService.assignBagToFe(p.bagId, p.feId, p.feBayId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useReleaseBagToFe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { bagId: string; feBayId?: string }) =>
      outboundService.releaseBagToFe(p.bagId, p.feBayId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useFeBays() {
  return useQuery({ queryKey: keys.bays(), queryFn: () => outboundService.listFeBays() })
}

export function useAllocateFeBay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { bayId: string; feId: string }) => outboundService.allocateFeBay(p.feId, p.bayId),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useFeQueue() {
  return useQuery({ queryKey: keys.feQueue(), queryFn: () => outboundService.listFeQueue() })
}

export function useFeCheckIns() {
  return useQuery({ queryKey: keys.feCheckIns(), queryFn: () => outboundService.listFeCheckIns() })
}

export function useVerifyFe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: { id: string; otp: string }) => outboundService.verifyFe(p.id, p.otp),
    onSuccess: () => invalidateOutbound(qc),
  })
}

export function useInFieldShipments() {
  return useQuery({ queryKey: keys.inField(), queryFn: () => outboundService.listInFieldShipments() })
}
