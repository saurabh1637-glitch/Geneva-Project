

'use client'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Heart3d from '../components/heart3d/Heart3DViewer'
import { api, handleApiError } from '../services/api'
import { 
  Users, 
  Activity, 
  Brain, 
  Heart, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Eye,
  BarChart3,
  Database
} from 'lucide-react'
import { Button, Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { StatCard, Table, Alert, Badge } from '../components/ui/DataDisplayComponents'
import { Container, Section, Grid, Flex, Spacer } from '../components/ui/LayoutComponents'
import { BarChartComponent, PieChartComponent } from '../components/charts/ChartComponents'
import { formatDateTime, getRiskBadgeClass, getRiskLabel } from '../utils/helpers'
import type { Patient, Analysis, DatasetSummary, HealthResponse } from '../types'

const demoStats = [
  { title: 'Patient Records', value: '246', change: '+12 this week', changeType: 'positive' as const, icon: <Users className="w-6 h-6" />, color: 'blue' as const },
  { title: 'Total Analyses', value: '1,834', change: '+89 today', changeType: 'positive' as const, icon: <Activity className="w-6 h-6" />, color: 'teal' as const },
  { title: 'Models Ready', value: '4/4', change: 'All targets loaded', changeType: 'neutral' as const, icon: <Brain className="w-6 h-6" />, color: 'amber' as const },
  { title: 'High Risk Alerts', value: '23', change: 'Requires review', changeType: 'negative' as const, icon: <AlertCircle className="w-6 h-6" />, color: 'red' as const },
]

export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [dataset, setDataset] = useState<DatasetSummary | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [healthRes, datasetRes, analysesRes] = await Promise.allSettled([
        api.healthCheck(),
        api.getDatasetSummary(),
        api.listAnalyses(undefined, 10),
      ])

      if (healthRes.status === 'fulfilled') setHealth(healthRes.value)
      if (datasetRes.status === 'fulfilled') setDataset(datasetRes.value)
      if (analysesRes.status === 'fulfilled') setRecentAnalyses(analysesRes.value)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  // Mock data for demo when API not available
  const mockAnalyses: Analysis[] = [
    {
      id: 1,
      patient_id: 'PAT-001',
      input_data: { age: 58, gender: 1, cp: 2, trestbps: 140, chol: 280, fbs: 0, restecg: 0, thalach: 150, exang: 0, oldpeak: 1.5, slope: 1, ca: 0, thal: 2 },
      cad_prediction: 1, lad_prediction: 1, lcx_prediction: 0, rca_prediction: 0,
      cad_probability: 0.82, lad_probability: 0.76, lcx_probability: 0.34, rca_probability: 0.28,
      feature_contributions: {}, model_version: '1.0.0',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      patient_id: 'PAT-002',
      input_data: { age: 45, gender: 0, cp: 1, trestbps: 120, chol: 220, fbs: 0, restecg: 0, thalach: 165, exang: 0, oldpeak: 0.5, slope: 1, ca: 0, thal: 0 },
      cad_prediction: 0, lad_prediction: 0, lcx_prediction: 0, rca_prediction: 0,
      cad_probability: 0.18, lad_probability: 0.12, lcx_probability: 0.08, rca_probability: 0.10,
      feature_contributions: {}, model_version: '1.0.0',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 3,
      patient_id: 'PAT-003',
      input_data: { age: 62, gender: 1, cp: 0, trestbps: 150, chol: 310, fbs: 1, restecg: 1, thalach: 135, exang: 1, oldpeak: 2.2, slope: 2, ca: 2, thal: 1 },
      cad_prediction: 1, lad_prediction: 1, lcx_prediction: 1, rca_prediction: 1,
      cad_probability: 0.94, lad_probability: 0.89, lcx_probability: 0.81, rca_probability: 0.77,
      feature_contributions: {}, model_version: '1.0.0',
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ]

  const displayAnalyses = recentAnalyses.length > 0 ? recentAnalyses : mockAnalyses
  const isDemoData = recentAnalyses.length === 0

  const cadDistribution = [
    { name: 'Low Risk (<40%)', value: 45, color: '#16A34A' },
    { name: 'Moderate (40-70%)', value: 30, color: '#D97706' },
    { name: 'High Risk (>70%)', value: 25, color: '#DC2626' },
  ]

  const vesselDistribution = [
    { name: 'LAD', value: 65, color: '#2563EB' },
    { name: 'LCX', value: 42, color: '#0D9488' },
    { name: 'RCA', value: 38, color: '#D97706' },
  ]

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of cardiovascular risk analyses and system status</p>
          </div>
          <Flex gap={3}>
            <Link to="/patients/new">
              <Button icon={<Plus className="w-4 h-4" />}>New Analysis</Button>
            </Link>
            <Link to="/model-performance">
              <Button variant="secondary" icon={<BarChart3 className="w-4 h-4" />}>Model Performance</Button>
            </Link>
          </Flex>
        </Flex>

        {/* Demo data notice */}
        {isDemoData && (
          <Alert type="info" title="Demo Mode" message="Showing sample data. Connect to backend and train models to see real analytics." className="mb-6" />
        )}

        {/* System Status */}
        {health && (
          <Flex gap={3} className="mb-6" wrap>
            <StatCard
              title="API Status"
              value={health.status === 'healthy' ? 'Healthy' : 'Degraded'}
              icon={<Heart className="w-6 h-6" />}
              color={health.status === 'healthy' ? 'green' : 'amber'}
              trend={health.status === 'healthy' ? 'up' : 'down'}
            />
            <StatCard
              title="Models Loaded"
              value={health.model_loaded ? 'Yes' : 'No'}
              icon={<Brain className="w-6 h-6" />}
              color={health.model_loaded ? 'blue' : 'red'}
            />
            <StatCard
              title="Dataset Loaded"
              value={health.dataset_loaded ? 'Yes' : 'No'}
              icon={<Database className="w-6 h-6" />}
              color={health.dataset_loaded ? 'teal' : 'red'}
            />
            <StatCard
              title="Targets Available"
              value={health.targets_available?.length || 0}
              icon={<TrendingUp className="w-6 h-6" />}
              color="purple"
            />
          </Flex>
        )}

        {/* Stats Cards */}
        <Grid cols={4} gap="lg" className="mb-8">
          {demoStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </Grid>

        {/* 3D Interactive Heart Visualizer Card */}
        <Card className="mb-8 overflow-hidden border border-gray-200 shadow-sm">
          <CardHeader>
            <Flex justify="between" align="center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" /> 
                  Interactive 3D Cardiovascular Model
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Drag with mouse to rotate 360°, scroll to zoom</p>
              </div>
              <Badge variant="blue">Live 3D Simulation</Badge>
            </Flex>
          </CardHeader>
          <CardBody className="p-0">
            <div className="w-full h-[520px]">
              <Heart3d />
            </div>
          </CardBody>
        </Card>

        {/* Charts Row */}
        <Grid cols={2} gap="lg" className="mb-8">
          <Card>
            <CardHeader>
              <Flex justify="between" align="center">
                <h3 className="text-lg font-semibold text-gray-900">CAD Risk Distribution</h3>
                <Badge variant="blue">Demo Data</Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              <PieChartComponent data={cadDistribution} height={300} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Flex justify="between" align="center">
                <h3 className="text-lg font-semibold text-gray-900">Vessel-Specific Predictions</h3>
                <Badge variant="teal">Positive Predictions</Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              <BarChartComponent
                data={vesselDistribution.map(d => ({ vessel: d.name, count: d.value }))}
                xKey="vessel"
                bars={[{ key: 'count', name: 'Positive Predictions', color: '#2563EB' }]}
                height={300}
              />
            </CardBody>
          </Card>
        </Grid>

        {/* Recent Analyses */}
        <Card>
          <CardHeader>
            <Flex justify="between" align="center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Analyses</h3>
              <Link to="/patients" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
            </Flex>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={[
                { key: 'patient_id', header: 'Patient', render: (row: Analysis) => (
                  <Link to={`/results/${row.id}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {row.patient_id}
                  </Link>
                )},
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
                  <Flex gap={2}>
                    <Link to={`/results/${row.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
                  </Flex>
                )},
              ]}
              data={displayAnalyses}
              keyExtractor={(row) => row.id.toString()}
              emptyMessage="No analyses yet. Create your first analysis to get started."
            />
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Section title="Quick Actions" className="mt-8">
          <Grid cols={4} gap="md">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-200" onClick={() => window.location.href = '/patients/new'}>
              <CardBody className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">New Analysis</h3>
                <p className="text-sm text-gray-500">Enter patient data and run prediction</p>
              </CardBody>
            </Card>
            
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/heart-3d'}>
              <CardBody className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">3D Heart View</h3>
                <p className="text-sm text-gray-500">Explore interactive heart visualization</p>
              </CardBody>
            </Card>
            
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/model-performance'}>
              <CardBody className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Model Performance</h3>
                <p className="text-sm text-gray-500">View detailed metrics and ROC curves</p>
              </CardBody>
            </Card>
            
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/dataset'}>
              <CardBody className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Dataset Explorer</h3>
                <p className="text-sm text-gray-500">Browse data schema and statistics</p>
              </CardBody>
            </Card>
          </Grid>
        </Section>
      </Container>
  )
}