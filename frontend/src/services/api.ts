import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type {
  Patient,
  PatientListResponse,
  PatientInput,
  PredictionResponse,
  Analysis,
  ModelPerformanceResponse,
  DatasetSummary,
  HealthResponse,
  ExplainabilityResponse,
  ReportResponse,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add any auth tokens here if needed
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 404) {
          console.error('Resource not found:', error.config?.url)
        } else if (error.response?.status === 503) {
          console.error('Service unavailable - models may not be loaded')
        } else if (error.response?.status && error.response.status >= 500) {
          console.error('Server error:', error.response.data)
        }
        return Promise.reject(error)
      }
    )
  }

  // Health
  async healthCheck(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/health')
    return response.data
  }

  // Dataset
  async getDatasetSummary(): Promise<DatasetSummary> {
    const response = await this.client.get<DatasetSummary>('/dataset/summary')
    return response.data
  }

  // Patients
  async createPatient(patient: { patient_id: string; age?: number; gender?: string }): Promise<Patient> {
    const response = await this.client.post<Patient>('/patients', patient)
    return response.data
  }

  async listPatients(page = 1, pageSize = 20, search?: string): Promise<PatientListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (search) params.append('search', search)
    const response = await this.client.get<PatientListResponse>(`/patients?${params}`)
    return response.data
  }

  async getPatient(id: number): Promise<Patient> {
    const response = await this.client.get<Patient>(`/patients/${id}`)
    return response.data
  }

  // Prediction
  async predictRisk(input: PatientInput): Promise<PredictionResponse> {
    const response = await this.client.post<PredictionResponse>('/predict', input)
    return response.data
  }

  // Analyses
  async createAnalysis(patientId: string, inputData: PatientInput): Promise<Analysis> {
    const response = await this.client.post<Analysis>('/analyses', {
      patient_id: patientId,
      input_data: inputData,
    })
    return response.data
  }

  async listAnalyses(patientId?: number, limit = 50): Promise<Analysis[]> {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (patientId) params.append('patient_id', patientId.toString())
    const response = await this.client.get<Analysis[]>(`/analyses?${params}`)
    return response.data
  }

  async getAnalysis(id: number): Promise<Analysis> {
    const response = await this.client.get<Analysis>(`/analyses/${id}`)
    return response.data
  }

  // Model Performance
  async getModelMetrics(): Promise<ModelPerformanceResponse> {
    const response = await this.client.get<ModelPerformanceResponse>('/models/metrics')
    return response.data
  }

  // Explainability
  async getExplainability(target: string, patientId?: number): Promise<ExplainabilityResponse> {
    const params = patientId ? `?patient_id=${patientId}` : ''
    const response = await this.client.get<ExplainabilityResponse>(`/explainability/${target}${params}`)
    return response.data
  }

  // Reports
  async generateReport(analysisId: number): Promise<{ pdf_path: string; report_id: number }> {
    const response = await this.client.post<{ pdf_path: string; report_id: number }>(`/reports/${analysisId}/pdf`)
    return response.data
  }

  async getReport(analysisId: number): Promise<ReportResponse> {
    const response = await this.client.get<ReportResponse>(`/reports/${analysisId}/pdf`)
    return response.data
  }

  async downloadReport(analysisId: number): Promise<Blob> {
    const response = await this.client.get(`/reports/${analysisId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  }
}

export const api = new ApiService()

// Helper function to handle API errors
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      return error.response.data.detail
    }
    if (error.message === 'Network Error') {
      return 'Cannot connect to server. Please ensure the backend is running.'
    }
    return error.message
  }
  return 'An unexpected error occurred'
}