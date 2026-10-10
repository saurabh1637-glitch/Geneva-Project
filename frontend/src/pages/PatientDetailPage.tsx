'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Card, CardHeader, CardBody, Button } from '../components/ui/FormComponents'
import { Table, Badge, Alert, StatCard } from '../components/ui/DataDisplayComponents'
import { Container, Section, Flex, Grid, Spacer } from '../components/ui/LayoutComponents'
import { ArrowLeft, Heart, Activity, FileText, Eye, TrendingUp, AlertCircle } from 'lucide-react'
import { formatDateTime, getRiskBadgeClass, getRiskLabel, cn } from '../utils/helpers'
import type { Patient, Analysis } from '../types'

const mockPatient: Patient = {
  id: 1,
  patient_id: 'PAT-001',
  age: 58,
  gender: 'Male',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
}

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
    patient_id: 'PAT-001',
    input_data: { age: 58, gender: 1, cp: 2, trestbps: 135, chol: 265, fbs: 0, restecg: 0, thalach: 152, exang: 0, oldpeak: 1.2, slope: 1, ca: 0, thal: 2 },
    cad_prediction: 1, lad_prediction: 1, lcx_prediction: 0, rca_prediction: 0,
    cad_probability: 0.78, lad_probability: 0.71, lcx_probability: 0.29, rca_probability: 0.24,
    feature_contributions: {}, model_version: '1.0.0',
    created_at: '2024-01-10T09:20:00Z',
  },
]

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    if (id) {
      loadPatientData()
    }
  }, [id])

  const loadPatientData = async () => {
    try {
      setLoading(true)
      const [patientRes, analysesRes] = await Promise.allSettled([
        api.getPatient(parseInt(id!)),
        api.listAnalyses(parseInt(id!)),
      ])

      if (patientRes.status === 'fulfilled') {
        setPatient(patientRes.value)
      } else {
        setPatient(mockPatient)
        setIsDemoData(true)
      }

      if (analysesRes.status === 'fulfilled') {
        setAnalyses(analysesRes.value)
      } else {
        setAnalyses(mockAnalyses)
        setIsDemoData(true)
      }
    } catch (err) {
      setError(handleApiError(err))
      setPatient(mockPatient)
      setAnalyses(mockAnalyses)
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container size="lg">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Container>
    )
  }

  if (!patient) {
    return (
        <Container size="lg">
          <Alert type="error" message="Patient not found" />
        </Container>
    )
  }

  const latestAnalysis = analyses[0]

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <Flex gap={4} align="center">
            <Link to="/patients" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.patient_id}</h1>
              <p className="text-gray-600">Patient Record</p>
            </div>
          </Flex>
          <Flex gap={2}>
            <Link to={`/patients/new`}>
              <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>New Analysis</Button>
            </Link>
          </Flex>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample patient data. Connect to backend to view real records." className="mb-6" />
        )}

        {/* Patient Info Cards */}
        <Grid cols={4} gap="lg" className="mb-8">
          <StatCard title="Age" value={patient.age || '—'} icon={<Heart className="w-6 h-6" />} color="blue" />
          <StatCard title="Gender" value={patient.gender || '—'} icon={<Activity className="w-6 h-6" />} color="teal" />
          <StatCard title="Total Analyses" value={analyses.length} icon={<FileText className="w-6 h-6" />} color="amber" />
          <StatCard title="Registered" value={formatDateTime(patient.created_at).split(',')[0]} icon={<TrendingUp className="w-6 h-6" />} color="purple" />
        </Grid>

        {/* Latest Analysis Summary */}
        {latestAnalysis && (
          <Card className="mb-8">
            <CardHeader>
              <Flex justify="between" align="center">
                <h3 className="text-lg font-semibold text-gray-900">Latest Analysis</h3>
                <Badge variant={getRiskBadgeClass(latestAnalysis.cad_probability).replace('badge-', '') as any}>
                  {getRiskLabel(latestAnalysis.cad_probability)} — {(latestAnalysis.cad_probability * 100).toFixed(1)}%
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              <Grid cols={4} gap="md">
                {[
                  { label: 'Overall CAD', prob: latestAnalysis.cad_probability, pred: latestAnalysis.cad_prediction },
                  { label: 'LAD', prob: latestAnalysis.lad_probability, pred: latestAnalysis.lad_prediction },
                  { label: 'LCX', prob: latestAnalysis.lcx_probability, pred: latestAnalysis.lcx_prediction },
                  { label: 'RCA', prob: latestAnalysis.rca_probability, pred: latestAnalysis.rca_prediction },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 text-center">
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{(item.prob * 100).toFixed(1)}%</p>
                    <Badge variant={getRiskBadgeClass(item.prob).replace('badge-', '') as any} className="mt-2">
                      {item.pred === 1 ? 'Positive' : 'Negative'}
                    </Badge>
                  </div>
                ))}
              </Grid>
              
              <Flex justify="end" className="mt-4" gap={2}>
                <Link to={`/results/${latestAnalysis.id}`}>
                  <Button variant="secondary" icon={<Eye className="w-4 h-4" />}>View Details</Button>
                </Link>
                <Link to={`/heart-3d`}>
                  <Button icon={<Heart className="w-4 h-4" />}>3D Visualization</Button>
                </Link>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Analysis History */}
        <Card>
          <CardHeader>
            <Flex justify="between" align="center">
              <h3 className="text-lg font-semibold text-gray-900">Analysis History</h3>
              <span className="text-sm text-gray-500">{analyses.length} total</span>
            </Flex>
          </CardHeader>
          <CardBody className="p-0">
            {analyses.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analyses yet for this patient</p>
                <Link to="/patients/new" className="mt-4 inline-block">
                  <Button icon={<FileText className="w-4 h-4" />}>Create First Analysis</Button>
                </Link>
              </div>
            ) : (
              <Table
                columns={[
                  { key: 'created_at', header: 'Date', render: (row: Analysis) => formatDateTime(row.created_at) },
                  { key: 'cad_probability', header: 'CAD Risk', render: (row: Analysis) => (
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeClass(row.cad_probability).replace('badge-', '') as any}>
                        {getRiskLabel(row.cad_probability)}
                      </Badge>
                      <span className="text-sm text-gray-500">{(row.cad_probability * 100).toFixed(1)}%</span>
                    </div>
                  )},
                  { key: 'lad_probability', header: 'LAD', render: (row: Analysis) => (
                    <Badge variant={getRiskBadgeClass(row.lad_probability).replace('badge-', '') as any}>
                      {(row.lad_probability * 100).toFixed(0)}%
                    </Badge>
                  )},
                  { key: 'lcx_probability', header: 'LCX', render: (row: Analysis) => (
                    <Badge variant={getRiskBadgeClass(row.lcx_probability).replace('badge-', '') as any}>
                      {(row.lcx_probability * 100).toFixed(0)}%
                    </Badge>
                  )},
                  { key: 'rca_probability', header: 'RCA', render: (row: Analysis) => (
                    <Badge variant={getRiskBadgeClass(row.rca_probability).replace('badge-', '') as any}>
                      {(row.rca_probability * 100).toFixed(0)}%
                    </Badge>
                  )},
                  { key: 'actions', header: 'Actions', render: (row: Analysis) => (
                    <Flex gap={1}>
                      <Link to={`/results/${row.id}`}>
                        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                      </Link>
                    </Flex>
                  )},
                ]}
                data={analyses}
                keyExtractor={(row) => row.id.toString()}
                emptyMessage="No analyses found"
              />
            )}
          </CardBody>
        </Card>
</Container>
    )
}