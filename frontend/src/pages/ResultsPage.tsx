'use client'

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import { Heart3DViewer } from '../components/heart3d/Heart3DViewer'
import { Card, CardHeader, CardBody, Button } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Container, Section, Flex, Grid } from '../components/ui/LayoutComponents'
import { ArrowLeft, Heart, Brain, Download, AlertCircle, Info, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { formatDateTime, getRiskBadgeClass, getRiskLabel, cn, formatPercent, formatFieldName } from '../utils/helpers'
import type { Analysis } from '../types'

const mockAnalysis: Analysis = {
  id: 1,
  patient_id: 'PAT-001',
  input_data: {
    age: 58, gender: 1, cp: 2, trestbps: 140, chol: 280, fbs: 0, restecg: 0,
    thalach: 150, exang: 0, oldpeak: 1.5, slope: 1, ca: 0, thal: 2,
    weight: 78, height: 170, bmi: 27, dm: 1, htn: 1, current_smoker: 0,
    ex_smoker: 1, fh: 1, obesity: 0, crf: 0, crl: 0, ef: 55, lv_mass: 180,
    region_rwma: 0, lvh: 0,
  },
  cad_prediction: 1, lad_prediction: 1, lcx_prediction: 0, rca_prediction: 0,
  cad_probability: 0.82, lad_probability: 0.76, lcx_probability: 0.34, rca_probability: 0.28,
  feature_contributions: {
    CAD: { age: 0.15, chol: 0.12, trestbps: 0.10, thalach: -0.08, oldpeak: 0.09, cp: 0.07, dm: 0.06, htn: 0.05, fh: 0.04, exang: 0.03 },
    LAD: { age: 0.14, chol: 0.11, oldpeak: 0.10, cp: 0.09, trestbps: 0.08, thalach: -0.07, dm: 0.06 },
    LCX: { age: 0.08, chol: 0.06, trestbps: 0.05, oldpeak: 0.04 },
    RCA: { age: 0.07, chol: 0.05, trestbps: 0.04, htn: 0.03 },
  },
  model_version: '1.0.0',
  created_at: '2024-01-15T10:35:00Z',
}

const vesselInfo = [
  { key: 'LAD', name: 'Left Anterior Descending', description: 'Supplies anterior wall of left ventricle and anterior septum' },
  { key: 'LCX', name: 'Left Circumflex', description: 'Supplies lateral wall of left ventricle' },
  { key: 'RCA', name: 'Right Coronary Artery', description: 'Supplies right ventricle, inferior wall of left ventricle, and SA/AV nodes' },
]

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null)
  const [showAllFeatures, setShowAllFeatures] = useState<Record<string, boolean>>({})
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    if (id) {
      loadAnalysis()
    }
  }, [id])

  const loadAnalysis = async () => {
    try {
      setLoading(true)
      const res = await api.getAnalysis(parseInt(id!))
      setAnalysis(res)
    } catch (err) {
      console.warn('Using demo data:', err)
      setAnalysis(mockAnalysis)
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

  if (!analysis) {
    return (
      <Container size="lg">
        <Alert type="error" message="Analysis not found" />
      </Container>
    )
  }

  const predictions = [
    { label: 'Overall CAD', prob: analysis.cad_probability, pred: analysis.cad_prediction, key: 'CAD', color: 'blue' },
    { label: 'LAD', prob: analysis.lad_probability, pred: analysis.lad_prediction, key: 'LAD', color: 'red' },
    { label: 'LCX', prob: analysis.lcx_probability, pred: analysis.lcx_prediction, key: 'LCX', color: 'teal' },
    { label: 'RCA', prob: analysis.rca_probability, pred: analysis.rca_prediction, key: 'RCA', color: 'amber' },
  ]

  const getTopFeatures = (target: string, count = 5) => {
    const contributions = analysis.feature_contributions?.[target] || {}
    return Object.entries(contributions)
      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
      .slice(0, count)
  }

  const toggleFeatureExpansion = (target: string) => {
    setShowAllFeatures(prev => ({ ...prev, [target]: !prev[target] }))
  }

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <Flex gap={4} align="center">
            <Link to="/patients" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
              <p className="text-gray-600">Patient: {analysis.patient_id} • {formatDateTime(analysis.created_at)}</p>
            </div>
          </Flex>
          <Flex gap={2}>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => window.open(`/api/reports/${analysis.id}/pdf`, '_blank')}>
              PDF Report
            </Button>
            <Link to={`/heart-3d`}>
              <Button icon={<Heart className="w-4 h-4" />}>3D Heart</Button>
            </Link>
            <Link to={`/explainability`}>
              <Button variant="secondary" icon={<Brain className="w-4 h-4" />}>Explainability</Button>
            </Link>
          </Flex>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample analysis results. Connect to backend to view real predictions." className="mb-6" />
        )}

        {/* Disclaimer */}
        <Alert type="warning" className="mb-6">
          <Flex gap={3} align="start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Research Use Only</p>
              <p className="mt-1 text-amber-800 text-sm">
                This prediction is generated by a research prototype (GENEVA) for the IIT Mandi Multimodal AI Hackathon 2026.
                It has <strong>not been clinically validated</strong> and should <strong>never</strong> be used as a substitute 
                for professional medical diagnosis. Always consult a qualified healthcare provider.
              </p>
            </div>
          </Flex>
        </Alert>

        {/* Main Predictions */}
        <Section title="Prediction Results" className="mb-8">
          <Grid cols={4} gap="lg">
            {predictions.map((item) => (
              <Card key={item.key} className={cn('h-full', selectedVessel === item.key && 'ring-2 ring-blue-500')}>
                <CardBody>
                  <Flex justify="between" align="start" className="mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.key === 'CAD' ? 'Overall coronary artery disease' : 
                         vesselInfo.find(v => v.key === item.key)?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedVessel(selectedVessel === item.key ? null : item.key)}
                      className={cn('p-1 rounded transition-colors', selectedVessel === item.key ? 'bg-blue-100' : 'hover:bg-gray-100')}
                    >
                      <Eye className={cn('w-4 h-4', selectedVessel === item.key ? 'text-blue-600' : 'text-gray-400')} />
                    </button>
                  </Flex>
                  
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-gray-900">{formatPercent(item.prob, 1)}</p>
                    <p className="text-sm text-gray-500 mt-1">Probability</p>
                  </div>
                  
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500',
                        item.prob >= 0.7 ? 'bg-red-500' :
                        item.prob >= 0.4 ? 'bg-amber-500' :
                        'bg-green-500'
                      )}
                      style={{ width: `${item.prob * 100}%` }}
                    />
                  </div>
                  
                  <Flex justify="center">
                    <Badge variant={getRiskBadgeClass(item.prob).replace('badge-', '') as any}>
                      {getRiskLabel(item.prob)}
                    </Badge>
                  </Flex>
                  
                  <Flex justify="center" className="mt-2">
                    <Badge variant={item.pred === 1 ? 'red' : 'green'}>
                      {item.pred === 1 ? 'Positive' : 'Negative'}
                    </Badge>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* 3D Heart Visualization */}
        <Section title="Interactive 3D Heart" description="Click on coronary arteries to highlight and view vessel-specific risk" className="mb-8">
          <Heart3DViewer
            predictions={{
              cad_prediction: analysis.cad_prediction,
              lad_prediction: analysis.lad_prediction,
              lcx_prediction: analysis.lcx_prediction,
              rca_prediction: analysis.rca_prediction,
              cad_probability: analysis.cad_probability,
              lad_probability: analysis.lad_probability,
              lcx_probability: analysis.lcx_probability,
              rca_probability: analysis.rca_probability,
              model_version: analysis.model_version,
              disclaimer: 'For research and educational use only. Not a substitute for professional medical diagnosis.',
            }}
            selectedVessel={selectedVessel}
            onVesselSelect={setSelectedVessel}
            height={450}
          />
        </Section>

        {/* Feature Contributions */}
        {analysis.feature_contributions && (
          <Section title="Feature Contributions (Model Explainability)" description="Top features influencing each prediction. Note: Feature importance indicates association, not causation." className="mb-8">
            <Grid cols={2} gap="lg">
              {predictions.filter(p => p.key !== 'CAD').map((item) => (
                <Card key={item.key} className="h-full">
                  <CardHeader>
                    <Flex justify="between" align="center">
                      <h3 className="font-semibold text-gray-900">{item.label} Contributions</h3>
                      <button
                        onClick={() => toggleFeatureExpansion(item.key)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {showAllFeatures[item.key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {showAllFeatures[item.key] ? 'Show Less' : 'Show More'}
                      </button>
                    </Flex>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Table
                      columns={[
                        { key: 'feature', header: 'Feature' },
                        { key: 'importance', header: 'Importance', render: (row: { importance: number }) => (
                          <Flex align="center" gap={2}>
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full rounded-full', row.importance >= 0 ? 'bg-red-500' : 'bg-blue-500')}
                                style={{ width: `${Math.min(Math.abs(row.importance) * 10, 100)}%` }}
                              />
                            </div>
                            <span className={cn('text-sm font-mono', row.importance >= 0 ? 'text-red-600' : 'text-blue-600')}>
                              {row.importance >= 0 ? '+' : ''}{row.importance.toFixed(4)}
                            </span>
                          </Flex>
                        )},
                      ]}
                      data={getTopFeatures(item.key, showAllFeatures[item.key] ? 20 : 5).map(([feature, importance]) => ({
                        feature: formatFieldName(feature),
                        importance,
                      }))}
                      keyExtractor={(row) => row.feature}
                      emptyMessage="No feature contributions available"
                    />
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {/* Input Features */}
        <Section title="Patient Input Features" className="mb-8">
          <Grid cols={2} gap="lg">
            {[
              { group: 'Demographics', fields: ['age', 'gender', 'weight', 'height', 'bmi'] },
              { group: 'Clinical', fields: ['cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'] },
              { group: 'Comorbidities', fields: ['dm', 'htn', 'current_smoker', 'ex_smoker', 'fh', 'obesity', 'crf', 'crl'] },
              { group: 'Echocardiography', fields: ['edv', 'esv', 'ef', 'lv_mass', 'region_rwma', 'lvh'] },
            ].map(({ group, fields }) => {
              const groupFields = fields.filter(f => analysis.input_data[f as keyof typeof analysis.input_data] !== undefined)
              if (groupFields.length === 0) return null
              
              return (
                <Card key={group}>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900">{group}</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Table
                      columns={[
                        { key: 'feature', header: 'Feature' },
                        { key: 'value', header: 'Value' },
                      ]}
                      data={groupFields.map(f => ({
                        feature: formatFieldName(f),
                        value: analysis.input_data[f as keyof typeof analysis.input_data],
                      }))}
                      keyExtractor={(row) => row.feature}
                      emptyMessage="No data"
                    />
                  </CardBody>
                </Card>
              )
            })}
          </Grid>
        </Section>

        {/* Model Info */}
        <Section title="Model Information">
          <Grid cols={2} gap="lg">
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Model Details</h3>
              </CardHeader>
              <CardBody>
                <Table
                  columns={[
                    { key: 'key', header: 'Property' },
                    { key: 'value', header: 'Value' },
                  ]}
                  data={[
                    { key: 'Model Version', value: analysis.model_version },
                    { key: 'Prediction Date', value: formatDateTime(analysis.created_at) },
                    { key: 'Dataset', value: 'Z-Alizadeh Sani' },
                    { key: 'Algorithm', value: 'Ensemble (RF/GB/LR)' },
                    { key: 'Validation', value: 'Stratified 80/20 split' },
                  ]}
                  keyExtractor={(row) => row.key}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Important Notes</h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    Predictions are probabilistic, not deterministic diagnoses
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    Vessel-specific predictions indicate stenosis ≥50% probability
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    Feature contributions show association, not causation
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    Clinical features alone cannot identify exact blockage location
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    Model trained on single-center dataset; not externally validated
                  </li>
                </ul>
              </CardBody>
            </Card>
          </Grid>
        </Section>
      </Container>
  )
}