import { useState, useEffect } from 'react'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Heart3DViewer } from '../components/heart3d/Heart3DViewer'
import { Card, CardHeader, CardBody, Button } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Container, Section, Grid, Flex } from '../components/ui/LayoutComponents'
import { Tabs } from '../components/ui/FormComponents'
import { Heart, Brain, Eye, Info, AlertCircle, Target, RotateCcw, ZoomIn, ZoomOut, MousePointerClick } from 'lucide-react'
import { cn, getRiskBadgeClass, getRiskLabel } from '../utils/helpers'
import type { PredictionResponse } from '../types'

const mockPredictions: PredictionResponse = {
  cad_prediction: 1,
  lad_prediction: 1,
  lcx_prediction: 0,
  rca_prediction: 0,
  cad_probability: 0.82,
  lad_probability: 0.76,
  lcx_probability: 0.34,
  rca_probability: 0.28,
  feature_contributions: {},
  model_version: '1.0.0',
  disclaimer: 'For research and educational use only. Not a substitute for professional medical diagnosis.',
}

const vesselDetails = [
  {
    key: 'LAD',
    name: 'Left Anterior Descending',
    fullName: 'Left Anterior Descending Artery (LAD)',
    description: 'The LAD supplies blood to the anterior wall of the left ventricle and the anterior portion of the interventricular septum. It is the largest coronary artery and is often called the "widow maker" when proximal occlusion occurs.',
    territory: 'Anterior LV wall, anterior septum, apex',
    clinicalSignificance: 'Proximal LAD occlusion causes large anterior MI with high mortality',
  },
  {
    key: 'LCX',
    name: 'Left Circumflex',
    fullName: 'Left Circumflex Artery (LCX)',
    description: 'The LCX curves around the left atrium and supplies the lateral wall of the left ventricle. It gives off obtuse marginal branches.',
    territory: 'Lateral LV wall, posterolateral LV',
    clinicalSignificance: 'LCX occlusion causes lateral MI; may be missed on standard ECG',
  },
  {
    key: 'RCA',
    name: 'Right Coronary Artery',
    fullName: 'Right Coronary Artery (RCA)',
    description: 'The RCA supplies the right ventricle, inferior wall of the left ventricle, and typically the SA and AV nodes. It gives off the posterior descending artery (PDA) in right-dominant circulation.',
    territory: 'RV, inferior LV wall, septum (inferior), SA/AV nodes',
    clinicalSignificance: 'RCA occlusion causes inferior MI; often associated with bradyarrhythmias',
  },
]

export function Heart3DPage() {
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'details'>('overview')
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      // Try to get latest analysis
      const analyses = await api.listAnalyses(undefined, 1)
      if (analyses.length > 0) {
        const latest = analyses[0]
        setPredictions({
          cad_prediction: latest.cad_prediction,
          lad_prediction: latest.lad_prediction,
          lcx_prediction: latest.lcx_prediction,
          rca_prediction: latest.rca_prediction,
          cad_probability: latest.cad_probability,
          lad_probability: latest.lad_probability,
          lcx_probability: latest.lcx_probability,
          rca_probability: latest.rca_probability,
          feature_contributions: latest.feature_contributions,
          model_version: latest.model_version,
          disclaimer: 'For research and educational use only. Not a substitute for professional medical diagnosis.',
        })
      } else {
        setPredictions(mockPredictions)
        setIsDemoData(true)
      }
    } catch (err) {
      console.warn('Using demo data:', err)
      setPredictions(mockPredictions)
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  const getVesselRisk = (vessel: string) => {
    if (!predictions) return 0
    switch (vessel) {
      case 'LAD': return predictions.lad_probability
      case 'LCX': return predictions.lcx_probability
      case 'RCA': return predictions.rca_probability
      default: return predictions.cad_probability
    }
  }

  const getVesselPrediction = (vessel: string) => {
    if (!predictions) return 0
    switch (vessel) {
      case 'LAD': return predictions.lad_prediction
      case 'LCX': return predictions.lcx_prediction
      case 'RCA': return predictions.rca_prediction
      default: return predictions.cad_prediction
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

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-600" />
              Interactive 3D Heart Visualization
            </h1>
            <p className="text-gray-600 mt-1">Explore coronary artery anatomy with real-time risk overlay</p>
          </div>
          <Flex gap={2}>
            <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={loadPredictions}>
              Refresh
            </Button>
          </Flex>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Mode" message="Showing sample predictions. Run an analysis or connect to backend to visualize real patient data." className="mb-6" />
        )}

        <Alert type="warning" className="mb-6">
          <Flex gap={3} align="start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Important Limitations</p>
              <p className="mt-1 text-amber-800 text-sm">
                This visualization shows <strong>model-predicted risk probabilities</strong>, not actual anatomical blockages. 
                Clinical features alone cannot identify the exact physical location of a stenosis. 
                The 3D model is a simplified anatomical representation for educational purposes.
              </p>
            </div>
          </Flex>
        </Alert>

        {/* Main View */}
        <Grid cols={12} gap="lg">
          {/* 3D Viewer - 8 columns */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="h-full">
              <CardHeader>
                <Flex justify="between" align="center">
                  <h3 className="font-semibold text-gray-900">Anatomical Heart Model</h3>
                  <Flex gap={1}>
                    <button
                      onClick={() => setViewMode('overview')}
                      className={cn('p-2 rounded-lg text-sm', viewMode === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100')}
                    >
                      <Eye className="w-4 h-4" /> Overview
                    </button>
                    <button
                      onClick={() => setViewMode('details')}
                      className={cn('p-2 rounded-lg text-sm', viewMode === 'details' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100')}
                    >
                      <Brain className="w-4 h-4" /> Details
                    </button>
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody className="p-0">
                <Heart3DViewer
                  predictions={predictions || undefined}
                  selectedVessel={selectedVessel}
                  onVesselSelect={setSelectedVessel}
                  height={550}
                />
              </CardBody>
            </Card>
          </div>

          {/* Sidebar - 4 columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Risk Summary */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Risk Summary</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 text-center">
                  <p className="text-sm font-medium text-gray-500">Overall CAD</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{(predictions?.cad_probability || 0) * 100}%</p>
                  <Badge variant={(predictions ? getRiskBadgeClass(predictions.cad_probability).replace('badge-', '') : 'blue') as 'red' | 'amber' | 'green' | 'blue'} className="mt-2">
                    {predictions ? getRiskLabel(predictions.cad_probability) : '—'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {vesselDetails.map((vessel) => {
                    const risk = getVesselRisk(vessel.key)
                    const pred = getVesselPrediction(vessel.key)
                    return (
                      <div key={vessel.key} className={cn('p-3 rounded-lg border transition-colors cursor-pointer', 
                        selectedVessel === vessel.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300')}
                        onClick={() => setSelectedVessel(selectedVessel === vessel.key ? null : vessel.key)}
                      >
                        <Flex justify="between" align="center" className="mb-2">
                          <span className="font-medium text-gray-900">{vessel.name}</span>
                          <Badge variant={getRiskBadgeClass(risk).replace('badge-', '') as 'red' | 'amber' | 'green'} className="text-xs">
                            {(risk * 100).toFixed(0)}%
                          </Badge>
                        </Flex>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-300',
                              risk >= 0.7 ? 'bg-red-500' :
                              risk >= 0.4 ? 'bg-amber-500' :
                              'bg-green-500'
                            )}
                            style={{ width: `${risk * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {pred === 1 ? 'Positive' : 'Negative'} prediction
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Selected Vessel Details */}
            {selectedVessel && (
              <Card>
                <CardHeader>
                  <Flex justify="between" align="center">
                    <h3 className="font-semibold text-gray-900">{selectedVessel} Details</h3>
                    <button onClick={() => setSelectedVessel(null)} className="text-sm text-gray-500 hover:text-gray-700">
                      <RotateCcw className="w-4 h-4" /> Clear
                    </button>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {(() => {
                    const vessel = vesselDetails.find(v => v.key === selectedVessel)
                    if (vessel) {
                      return (
                        <>
                          <p className="text-sm text-gray-600 mb-4">{vessel.description}</p>
                          
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">Territory</p>
                              <p className="text-gray-600">{vessel.territory}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Clinical Significance</p>
                              <p className="text-gray-600">{vessel.clinicalSignificance}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Model Prediction</p>
                              <Flex gap={2} align="center">
                                <Badge variant={getVesselPrediction(selectedVessel) === 1 ? 'red' : 'green'}>
                                  {getVesselPrediction(selectedVessel) === 1 ? 'Positive' : 'Negative'}
                                </Badge>
                                <span className="text-gray-600">{(getVesselRisk(selectedVessel) * 100).toFixed(1)}% probability</span>
                              </Flex>
                            </div>
                          </div>
                        </>
                      )
                    }
                    return null
                  })()}
                </CardBody>
              </Card>
            )}

            {/* Controls Help */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MousePointerClick className="w-5 h-5 text-blue-600" />
                  Controls
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MousePointerClick className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Left Click + Drag</p>
                      <p className="text-gray-500">Rotate the heart</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Scroll Wheel</p>
                      <p className="text-gray-500">Zoom in/out</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Click Vessel</p>
                      <p className="text-gray-500">Select artery for details</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Right Click + Drag</p>
                      <p className="text-gray-500">Pan the view</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Risk Legend
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[
                    { label: 'Low Risk', range: '< 40%', color: '#16A34A', description: 'Probability < 40%' },
                    { label: 'Moderate Risk', range: '40–70%', color: '#D97706', description: 'Probability 40–70%' },
                    { label: 'High Risk', range: '> 70%', color: '#DC2626', description: 'Probability > 70%' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-3 rounded" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.range} — {item.description}</p>
                      </div>
                    </div>
                  ))}
</div>
              </CardBody>
            </Card>
           </div>
        </Grid>

        {/* Vessel Information Tabs */}
        <Section title="Coronary Artery Anatomy" className="mt-8">
          <Tabs
            tabs={vesselDetails.map(v => ({ id: v.key, label: v.name, icon: <Target className="w-4 h-4" /> }))}
            activeTab={selectedVessel || 'LAD'}
            onChange={setSelectedVessel}
            className="mb-6"
          />
          
          <Grid cols={3} gap="lg">
            {vesselDetails.map((vessel) => (
              <Card key={vessel.key}>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">{vessel.fullName}</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <p className="text-sm text-gray-600">{vessel.description}</p>
                  
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Territory</p>
                      <p className="text-sm text-gray-900">{vessel.territory}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clinical Significance</p>
                      <p className="text-sm text-gray-900">{vessel.clinicalSignificance}</p>
                    </div>
                    {predictions && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model Prediction</p>
                        <Flex justify="between" align="center" className="mt-1">
                          <Badge variant={getVesselPrediction(vessel.key) === 1 ? 'red' : 'green'}>
                            {getVesselPrediction(vessel.key) === 1 ? 'Positive' : 'Negative'}
                          </Badge>
                          <span className="font-mono text-sm">
                            {(getVesselRisk(vessel.key) * 100).toFixed(1)}%
                          </span>
                        </Flex>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Section>
      </Container>
  )
}