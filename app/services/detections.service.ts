import detectionsMock from '~~/data/detections.json'
import detectionPageMock from '~~/data/detection-page.json'
import importResultMock from '~~/data/import-result.json'
import type { components } from '#open-fetch-schemas/api'
import { useMocksEnabled } from './config'

type Detection = components['schemas']['Detection']
type NewDetection = components['schemas']['NewDetection']
type DetectionBulkCreated = components['schemas']['DetectionBulkCreated']
type DetectionPage = components['schemas']['DetectionPage']
type ImportResult = components['schemas']['ImportResult']
const typedDetectionsMock = detectionsMock as Detection[]
const typedDetectionPageMock = detectionPageMock as DetectionPage
const typedImportResultMock = importResultMock as ImportResult
const firstDetectionMock = typedDetectionsMock[0]!

interface DetectionQuery {
  bbox?: string
  lat?: number
  lon?: number
  radius_km?: number
  polygon?: string
  from?: string
  to?: string
  instrument?: string
  satellite?: string
  min_confidence?: 'low' | 'nominal' | 'high'
  daynight?: 'D' | 'N'
  limit?: number
  offset?: number
  format?: 'json' | 'csv'
}

export async function searchDetections(query?: DetectionQuery): Promise<DetectionPage | string> {
  if (useMocksEnabled()) return query?.format === 'csv' ? 'id,latitude,longitude\n101,13.6929,-89.2182\n' : typedDetectionPageMock
  const { $api } = useNuxtApp()
  return $api('/detections', { query })
}

export async function createDetection(body: NewDetection): Promise<Detection> {
  if (useMocksEnabled()) return firstDetectionMock
  const { $api } = useNuxtApp()
  return $api('/detections', { method: 'POST', body })
}

export async function createDetectionsBulk(body: NewDetection[]): Promise<DetectionBulkCreated> {
  if (useMocksEnabled()) return { count: body.length, items: body.map((_, index) => typedDetectionsMock[index % typedDetectionsMock.length] ?? firstDetectionMock) }
  const { $api } = useNuxtApp()
  return $api('/detections/bulk', { method: 'POST', body })
}

export async function importDetectionsCsv(body: string, query?: { instrument?: string, skip_invalid?: boolean }): Promise<ImportResult> {
  if (useMocksEnabled()) return typedImportResultMock
  const { $api } = useNuxtApp()
  return $api('/detections/import', { method: 'POST', query, body, headers: { 'content-type': 'text/csv' } })
}

export async function getDetection(id: number): Promise<Detection> {
  if (useMocksEnabled()) return typedDetectionsMock.find(detection => detection.id === id) ?? firstDetectionMock
  const { $api } = useNuxtApp()
  return $api('/detections/{id}', { path: { id } })
}
