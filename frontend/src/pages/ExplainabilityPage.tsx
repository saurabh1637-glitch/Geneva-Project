'use client'

import { useEffect, useState } from 'react'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Container, Section, Grid, Flex } from '../components/ui/LayoutComponents'
import { Tabs } from '../components/ui/FormComponents'
import { BarChartComponent } from '../components/charts/ChartComponents'
import { Brain, Target, Info, AlertCircle, Filter, Search } from 'lucide-react'
import { cn, formatFieldName } from '../utils/helpers'
import type { ExplainabilityResponse } from '../types'

const mockExplainability = {
  CAD: {
    target: 'CAD',
    method: 'feature_importance',
    feature_importance: {
      age: 0.152, chol: 0.124, trestbps: 0.098, thalach: -0.087, oldpeak: 0.082,
      cp: 0.071, dm: 0.063, htn: 0.054, fh: 0.042, exang: 0.038,
      restecg: 0.031, slope: 0.025, ca: 0.021, thal: 0.018,
      gender: 0.015, fbs: 0.012, weight: 0.009, height: 0.008,
    },
    note: 'SHAP values not available. Showing model feature importance instead.'
  },
  LAD: {
    target: 'LAD',
    method: 'feature_importance',
    feature_importance: {
      age: 0.141, chol: 0.112, oldpeak: 0.095, cp: 0.088, trestbps: 0.079,
      thalach: -0.071, dm: 0.062, htn: 0.045, exang: 0.034, fh: 0.029,
    },
    note: 'SHAP values not available. Showing model feature importance instead.'
  },
  LCX: {
    target: 'LCX',
    method: 'feature_importance',
    feature_importance: {
      age: 0.082, chol: 0.064, trestbps: 0.051, oldpeak: 0.043,
      cp: 0.038, thalach: -0.031, dm: 0.028, htn: 0.022,
    },
    note: 'SHAP values not available. Showing model feature importance instead.'
  },
  RCA: {
    target: 'RCA',
    method: 'feature_importance',
    feature_importance: {
      age: 0.071, chol: 0.053, trestbps: 0.042, htn: 0.038,
      oldpeak: 0.031, cp: 0.028, thalach: -0.025, dm: 0.021,
    },
    note: 'SHAP values not available. Showing model feature importance instead.'
  },
}

export function ExplainabilityPage() {
  const [explanations, setExplanations] = useState<Record<string, ExplainabilityResponse>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTarget, setActiveTarget] = useState<'CAD' | 'LAD' | 'LCX' | 'RCA'>('CAD')
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    loadExplainability()
  }, [])

  const loadExplainability = async () => {
    try {
      setLoading(true)
      const targets: ('CAD' | 'LAD' | 'LCX' | 'RCA')[] = ['CAD', 'LAD', 'LCX', 'RCA']
      const results = await Promise.allSettled(
        targets.map(t => api.getExplainability(t))
      )
      
      const loaded: Record<string, ExplainabilityResponse> = {}
      let hasRealData = false
      
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          loaded[targets[i]] = res.value
          if (!res.value.note) hasRealData = true
        }
      })
      
      if (hasRealData) {
        setExplanations(loaded)
      } else {
        setExplanations(mockExplainability)
        setIsDemoData(true)
      }
    } catch (err) {
      console.warn('Using demo data:', err)
      setExplanations(mockExplainability)
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  const targets = [
    { id: 'CAD', label: 'Overall CAD', icon: <Target className="w-4 h-4" />, color: 'blue' },
    { id: 'LAD', label: 'LAD', icon: <Target className="w-4 h-4" />, color: 'red' },
    { id: 'LCX', label: 'LCX', icon: <Target className="w-4 h-4" />, color: 'teal' },
    { id: 'RCA', label: 'RCA', icon: <Target className="w-4 h-4" />, color: 'amber' },
  ] as const

  const currentExplanation = explanations[activeTarget]

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              Explainable AI
            </h1>
            <p className="text-gray-600 mt-1">Feature importance and model explanations for each prediction target</p>
          </div>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample feature importance. Train models with SHAP support to see instance-level explanations." className="mb-6" />
        )}

        <Alert type="warning" className="mb-6">
          <Flex gap={3} align="start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Association ≠ Causation</p>
              <p className="mt-1 text-amber-800 text-sm">
                Feature importance and SHAP values indicate <strong>statistical association</strong> between input features 
                and model predictions, not causal relationships. Clinical decisions should never be based solely on these explanations.
              </p>
            </div>
          </Flex>
        </Alert>

        {/* Target Selector */}
        <Card className="mb-6">
          <CardBody>
            <Flex gap={3} wrap>
              {targets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => setActiveTarget(target.id as typeof activeTarget)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTarget === target.id
                      ? `bg-${target.color}-600 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {target.icon}
                  {target.label}
                </button>
              ))}
            </Flex>
          </CardBody>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : currentExplanation ? (
          <>
            {/* Method Indicator */}
            <Alert type="info" className="mb-6">
              <Flex gap={3} align="start">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Explanation Method: {currentExplanation.method === 'shap' ? 'SHAP Values' : 'Model Feature Importance'}</p>
                  {currentExplanation.note && (
                    <p className="mt-1 text-blue-800 text-sm">{currentExplanation.note}</p>
                  )}
                </div>
              </Flex>
            </Alert>

            {/* Feature Importance Chart */}
            <Section title={`${activeTarget} Feature Importance`} className="mb-8">
              <Card>
                <CardBody>
                  {currentExplanation.feature_importance && (
                    <BarChartComponent
                      data={Object.entries(currentExplanation.feature_importance)
                        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                        .map(([feature, importance]) => ({
                          feature: formatFieldName(feature),
                          importance: Math.abs(importance),
                          direction: importance >= 0 ? 'positive' : 'negative',
                        })).slice(0, 20)}
                      xKey="feature"
                      bars={[
                        { key: 'importance', name: 'Importance', color: '#2563EB' },
                      ]}
                      height={400}
                      horizontal={true}
                    />
                  )}
                  {currentExplanation.shap_values && currentExplanation.feature_names && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Instance-Level SHAP Values</h4>
                      <BarChartComponent
                        data={currentExplanation.feature_names
                          .map((name, i) => ({ feature: formatFieldName(name), shap: currentExplanation.shap_values![i] }))
                          .sort((a, b) => Math.abs(b.shap) - Math.abs(a.shap))
                          .slice(0, 20)}
                        xKey="feature"
                        bars={[
                          { key: 'shap', name: 'SHAP Value', color: '#DC2626' },
                        ]}
                        height={400}
                        horizontal={true}
                      />
                    </div>
                  )}
                </CardBody>
              </Card>
            </Section>

            {/* Detailed Feature Table */}
            <Section title="Feature Details">
              <Card>
                <CardBody className="p-0">
                  {currentExplanation.feature_importance && (
                    <Table
                      columns={[
                        { key: 'feature', header: 'Feature', render: (row: { feature: string; importance: number; direction: string }) => (
                          <span className="font-medium">{row.feature}</span>
                        )},
                        { key: 'importance', header: 'Importance', render: (row: { feature: string; importance: number; direction: string }) => (
                          <Flex align="center" gap={2}>
                            <Badge variant={row.direction === 'positive' ? 'red' : 'blue'}>
                              {row.direction === 'positive' ? '↑ Increases Risk' : '↓ Decreases Risk'}
                            </Badge>
                            <span className="font-mono text-sm">{Math.abs(row.importance).toFixed(4)}</span>
                          </Flex>
                        )},
                      ]}
                      data={Object.entries(currentExplanation.feature_importance)
                        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                        .map(([feature, importance]) => ({
                          feature: formatFieldName(feature),
                          importance: Math.abs(importance),
                          direction: importance >= 0 ? 'positive' : 'negative',
                        }))}
                      keyExtractor={(row) => row.feature}
                    />
                  )}
                </CardBody>
              </Card>
            </Section>

            {/* Interpretation Guide */}
            <Section title="Interpretation Guide">
              <Grid cols={2} gap="lg">
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      What Feature Importance Means
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Higher values indicate stronger influence on model predictions</li>
                      <li>Positive direction: Feature increases predicted risk</li>
                      <li>Negative direction: Feature decreases predicted risk</li>
                      <li>Based on model's internal learned patterns</li>
                      <li>Does not imply clinical causation</li>
                    </ul>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Important Limitations
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Correlation ≠ Causation in clinical context</li>
                      <li>Model may learn dataset-specific patterns</li>
                      <li>Feature interactions not captured in univariate importance</li>
                      <li>SHAP values provide instance-level, not population-level explanations</li>
                      <li>Clinical validation required before any medical application</li>
                    </ul>
                  </CardBody>
                </Card>
              </Grid>
            </Section>
          </>
        ) : (
          <Alert type="error" message="No explanation data available for this target" />
        )}
      </Container>
  )
}