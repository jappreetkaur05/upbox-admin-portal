import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { barcodesAdminService } from '@/services/barcodesAdmin.service'
import type {
  BarcodeEntityType,
  BarcodeSymbology,
  LabelTemplate,
  LabelType,
  QrMode,
  ScannerSettings,
} from '@/types/barcodesAdmin'

const KEY = 'barcodes-admin'

export function useGeneratedBarcodes() {
  return useQuery({ queryKey: [KEY, 'barcodes'], queryFn: () => barcodesAdminService.listBarcodes() })
}

export function useGenerateBarcodes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      symbology: BarcodeSymbology
      entityType: BarcodeEntityType
      entityRef: string
      count: number
    }) => barcodesAdminService.generateBarcodes(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'barcodes'] }),
  })
}

export function useGeneratedQrs() {
  return useQuery({ queryKey: [KEY, 'qrs'], queryFn: () => barcodesAdminService.listQrs() })
}

export function useGenerateQrs() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      payload: string
      mode: QrMode
      entityType: BarcodeEntityType
      entityRef: string
      count: number
    }) => barcodesAdminService.generateQrs(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'qrs'] }),
  })
}

export function useLabelTemplates() {
  return useQuery({ queryKey: [KEY, 'templates'], queryFn: () => barcodesAdminService.listTemplates() })
}

export function useUpsertLabelTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<LabelTemplate, 'id'> & { id?: string }) =>
      barcodesAdminService.upsertTemplate(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'templates'] }),
  })
}

export function usePrintJobs() {
  return useQuery({ queryKey: [KEY, 'prints'], queryFn: () => barcodesAdminService.listPrintJobs() })
}

export function useCreatePrintJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      templateId: string
      labelType: LabelType
      targets: string[]
      copies: number
    }) => barcodesAdminService.createPrintJob(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'prints'] }),
  })
}

export function useMarkPrinted() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => barcodesAdminService.markPrinted(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'prints'] }),
  })
}

export function useReprintJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => barcodesAdminService.reprint(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'prints'] }),
  })
}

export function useScanHistory() {
  return useQuery({
    queryKey: [KEY, 'scan-history'],
    queryFn: () => barcodesAdminService.listScanHistory(),
  })
}

export function useScannerSettings() {
  return useQuery({
    queryKey: [KEY, 'settings'],
    queryFn: () => barcodesAdminService.getScannerSettings(),
  })
}

export function useSaveScannerSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (s: ScannerSettings) => barcodesAdminService.saveScannerSettings(s),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'settings'] }),
  })
}
