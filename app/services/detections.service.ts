import detectionsMock from '~~/data/detections.json'
import detectionPageMock from '~~/data/detection-page.json'
import importResultMock from '~~/data/import-result.json'
import { ResponseFormatEnum } from '~/enums/response-format.enum'
import type {
  Detection,
  DetectionBulkCreated,
  DetectionPage,
  DetectionQuery,
  ImportDetectionsCsvQuery,
  ImportResult,
  NewDetection
} from '~/types/api/detections'
import { useMocksEnabled } from './config'

const typedDetectionsMock = detectionsMock as Detection[]
const typedDetectionPageMock = detectionPageMock as DetectionPage
const typedImportResultMock = importResultMock as ImportResult
const firstDetectionMock = typedDetectionsMock[0]!

const DetectionsService = {
  async searchDetections(query?: DetectionQuery): Promise<DetectionPage | string> {
    if (useMocksEnabled()) return query?.format === ResponseFormatEnum.Csv ? 'id,latitude,longitude\n101,13.6929,-89.2182\n' : typedDetectionPageMock
    const { $api } = useNuxtApp()
    return $api('/detections', { query })
  },

  async createDetection(body: NewDetection): Promise<Detection> {
    if (useMocksEnabled()) return firstDetectionMock
    const { $api } = useNuxtApp()
    return $api('/detections', { method: 'POST', body }) as Promise<Detection>
  },

  async createDetectionsBulk(body: NewDetection[]): Promise<DetectionBulkCreated> {
    if (useMocksEnabled()) return { count: body.length, items: body.map((_, index) => typedDetectionsMock[index % typedDetectionsMock.length] ?? firstDetectionMock) }
    const { $api } = useNuxtApp()
    return $api('/detections', { method: 'POST', body }) as Promise<DetectionBulkCreated>
  },

  async importDetectionsCsv(body: string, query?: ImportDetectionsCsvQuery): Promise<ImportResult> {
    if (useMocksEnabled()) return typedImportResultMock
    const { $api } = useNuxtApp()
    return $api('/detections/import', { method: 'POST', query, body, headers: { 'content-type': 'text/csv' } })
  },

  async getDetection(id: number): Promise<Detection> {
    if (useMocksEnabled()) return typedDetectionsMock.find(detection => detection.id === id) ?? firstDetectionMock
    const { $api } = useNuxtApp()
    return $api('/detections/{id}', { path: { id } })
  }
}

export default DetectionsService
