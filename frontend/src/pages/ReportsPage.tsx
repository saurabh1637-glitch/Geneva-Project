'use client'

import { useEffect, useState } from 'react'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Card, CardHeader, CardBody, Button } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Container, Section, Flex, Grid } from '../components/ui/LayoutComponents'
import { FileText, Download, Eye, RefreshCw, AlertCircle, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { formatDateTime, cn } from '../utils/helpers'
import type { Analysis, ReportResponse } from '../types'

const mockAnalyses: Analysis[] = [
  {
    id: 1,
    patient_id: 'PAT-001',
    input_data: { age: 58, gender: 1, cp: 2, trestbps: 140, chol: 280, fbs: 0, restecg: 0, thalach: 150, exang: 0, oldpeak: 1.5, slope: 1, ca: 0, thal: 2 },
    cad_prediction: 1, lad_prediction: 1, lcx_prediction: 0, rca_prediction: 0,
    cad_probability: 0.82, lad_probability: 0.76, lcx_probability: 0.34, rca_probability: 0.28,
    feature_contributions: {}, model_version: '1.0.0',
    created_at: '2024-01-15T10:35:00Z',
  },
  {
    id: 2,
    patient_id: 'PAT-002',
    input_data: { age: 45, gender: 0, cp: 1, trestbps: 120, chol: 220, fbs: 0, restecg: 0, thalach: 165, exang: 0, oldpeak: 0.5, slope: 1, ca: 0, thal: 0 },
    cad_prediction: 0, lad_prediction: 0, lcx_prediction: 0, rca_prediction: 0,
    cad_probability: 0.18, lad_probability: 0.12, lcx_probability: 0.08, rca_probability: 0.10,
    feature_contributions: {}, model_version: '1.0.0',
    created_at: '2024-01-14T14:25:00Z',
  },
  {
    id: 3,
    patient_id: 'PAT-003',
    input_data: { age: 62, gender: 1, cp: 0, trestbps: 150, chol: 310, fbs: 1, restecg: 1, thalach: 135, exang: 1, oldpeak: 2.2, slope: 2, ca: 2, thal: 1 },
    cad_prediction: 1, lad_prediction: 1, lcx_prediction: 1, rca_prediction: 1,
    cad_probability: 0.94, lad_probability: 0.89, lcx_probability: 0.81, rca_probability: 0.77,
    feature_contributions: {}, model_version: '1.0.0',
    created_at: '2024-01-13T09:20:00Z',
  },
]

const mockReports: Record<number, ReportResponse> = {
  1: { id: 1, analysis_id: 1, pdf_path: '/reports/GENEVA_Report_PAT-001_20240115_103500.pdf', generated_at: '2024-01-15T10:36:00Z' },
  3: { id: 3, analysis_id: 3, pdf_path: '/reports/GENEVA_Report_PAT-003_20240113_092100.pdf', generated_at: '2024-01-13T09:22:00Z' },
}

export function ReportsPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [reports, setReports] = useState<Record<number, ReportResponse>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [analysesRes, reportsRes] = await Promise.allSettled([
        api.listAnalyses(undefined, 50),
        Promise.resolve({}), // Reports would be fetched per analysis
      ])

      if (analysesRes.status === 'fulfilled') {
        setAnalyses(analysesRes.value)
      } else {
        setAnalyses(mockAnalyses)
        setIsDemoData(true)
      }

      if (reportsRes.status === 'fulfilled') {
        setReports(reportsRes.value)
      } else {
        setReports(mockReports)
        setIsDemoData(true)
      }
    } catch (err) {
      console.warn('Using demo data:', err)
      setAnalyses(mockAnalyses)
      setReports(mockReports)
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (analysisId: number) => {
    setGenerating(prev => ({ ...prev, [analysisId]: true }))
    setError(null)

    try {
      const result = await api.generateReport(analysisId)
      setReports(prev => ({ ...prev, [analysisId]: { id: result.report_id, analysis_id: analysisId, pdf_path: result.pdf_path, generated_at: new Date().toISOString() } }))
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setGenerating(prev => ({ ...prev, [analysisId]: false }))
    }
  }

  const downloadReport = async (analysisId: number) => {
    const report = reports[analysisId]
    if (!report) {
      await generateReport(analysisId)
      return
    }
    
    try {
      const blob = await api.downloadReport(analysisId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.pdf_path.split('/').pop() || `report-${analysisId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(handleApiError(err))
    }
  }

  const getRiskBadgeClass = (prob: number) => {
    if (prob >= 0.7) return 'bg-red-100 text-red-800'
    if (prob >= 0.4) return 'bg-amber-100 text-amber-800'
    return 'bg-green-100 text-green-800'
  }

  const getRiskLabel = (prob: number) => {
    if (prob >= 0.7) return 'High Risk'
    if (prob >= 0.4) return 'Moderate Risk'
    return 'Low Risk'
  }

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Reports
            </h1>
            <p className="text-gray-600 mt-1">Generate and download PDF reports for cardiovascular risk analyses</p>
          </div>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample analyses. Connect to backend to generate real PDF reports." className="mb-6" />
        )}

        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />}

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <Flex justify="between" align="center">
              <h3 className="font-semibold text-gray-900">Available Analyses</h3>
              <span className="text-sm text-gray-500">{analyses.length} total</span>
            </Flex>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-500">Loading analyses...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analyses found. Create an analysis to generate a report.</p>
              </div>
            ) : (
              <Table
                columns={[
                  { key: 'patient_id', header: 'Patient', render: (row: Analysis) => (
                    <span className="font-medium text-blue-600">{row.patient_id}</span>
                  )},
                  { key: 'created_at', header: 'Analysis Date', render: (row: Analysis) => formatDateTime(row.created_at) },
                  { key: 'cad_probability', header: 'CAD Risk', render: (row: Analysis) => (
                    <Flex align="center" gap={2}>
                      <Badge variant={getRiskBadgeClass(row.cad_probability).replace('badge-', '') as 'red' | 'amber' | 'green'}>
                        {getRiskLabel(row.cad_probability)}
                      </Badge>
                      <span className="text-sm text-gray-500">{(row.cad_probability * 100).toFixed(1)}%</span>
                    </Flex>
                  )},
                  { key: 'vessels', header: 'Vessels', render: (row: Analysis) => (
                    <Flex gap={1} wrap>
                      {[
                        { label: 'LAD', prob: row.lad_probability },
                        { label: 'LCX', prob: row.lcx_probability },
                        { label: 'RCA', prob: row.rca_probability },
                      ].map((v) => (
                        <Badge key={v.label} variant={getRiskBadgeClass(v.prob).replace('badge-', '') as 'red' | 'amber' | 'green'} className="text-xs">
                          {v.label}: {(v.prob * 100).toFixed(0)}%
                        </Badge>
                      ))}
                    </Flex>
                  )},
                  { key: 'report_status', header: 'Report', render: (row: Analysis) => {
                    const report = reports[row.id]
                    if (report) {
                      return (
                        <Flex gap={1} align="center">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-700">Generated</span>
                          <span className="text-xs text-gray-400">({formatDateTime(report.generated_at).split(',')[0]})</span>
                        </Flex>
                      )
                    }
                    return (
                      <span className="text-sm text-gray-400">Not generated</span>
                    )
                  }},
                  { key: 'actions', header: 'Actions', render: (row: Analysis) => {
                    const report = reports[row.id]
                    const isGenerating = generating[row.id]
                    
                    return (
                      <Flex gap={1}>
                        {report ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => downloadReport(row.id)}
                              disabled={isGenerating}
                            >
                              {isGenerating && <span className="animate-spin">⟳</span>}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => window.open(`/api/reports/${row.id}/pdf`, '_blank')}
                            />
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            icon={<FileText className="w-4 h-4" />}
                            onClick={() => generateReport(row.id)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <span className="animate-spin">⟳</span> Generating...
                              </>
                            ) : 'Generate'}
                          </Button>
                        )}
                      </Flex>
                    )
                  }},
                ]}
                data={analyses}
                keyExtractor={(row) => row.id.toString()}
              />
            )}
          </CardBody>
        </Card>

        {/* Report Info */}
        <Section title="Report Information" className="mt-8">
          <Grid cols={2} gap="lg">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Report Contents
                </h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Patient demographics & clinical data</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> CAD and vessel-specific predictions</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Risk probabilities with visual indicators</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Feature contributions (when available)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Model information & version</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Methodology & limitations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Medical disclaimer & research notice</li>
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Important Notes
                </h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                  <li>Reports are generated on-demand and not stored permanently</li>
                  <li>PDF generation uses ReportLab library</li>
                  <li>Reports include all input features and predictions</li>
                  <li>Medical disclaimer included on every page</li>
                  <li>Not a substitute for clinical documentation</li>
                  <li>For research and educational use only</li>
                </ul>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Report Generation Process
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[
                    { step: 1, title: 'Select Analysis', description: 'Choose an analysis from the table above' },
                    { step: 2, title: 'Generate Report', description: 'Click "Generate" to create PDF via backend' },
                    { step: 3, title: 'Download', description: 'Click "Download" to save PDF locally' },
                    { step: 4, title: 'View Online', description: 'Click "View" to open PDF in browser' },
                  ].map((item) => (
                    <Flex key={item.step} gap={4} align="center">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </Flex>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Grid>
        </Section>
      </Container>
  )
}