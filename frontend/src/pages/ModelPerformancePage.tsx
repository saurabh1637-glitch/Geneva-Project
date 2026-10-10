'use client'

import { useEffect, useState } from 'react'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Container, Section, Grid, Flex } from '../components/ui/LayoutComponents'
import { Tabs } from '../components/ui/FormComponents'
import { 
  BarChartComponent, 
  ROCChartComponent, 
  ConfusionMatrixComponent,
  PieChartComponent 
} from '../components/charts/ChartComponents'
import { Brain, TrendingUp, Target, AlertCircle, Info } from 'lucide-react'
import { cn } from '../utils/helpers'
import type { ModelPerformanceResponse, ModelMetric } from '../types'

const mockMetrics: ModelPerformanceResponse = {
  metrics: [
    {
      target: 'CAD',
      accuracy: 0.85,
      precision: 0.82,
      recall: 0.78,
      f1_score: 0.80,
      roc_auc: 0.91,
      confusion_matrix: [[85, 15], [22, 78]],
      test_samples: 200,
      class_distribution: { '0': 100, '1': 100 },
    },
    {
      target: 'LAD',
      accuracy: 0.81,
      precision: 0.77,
      recall: 0.72,
      f1_score: 0.74,
      roc_auc: 0.87,
      confusion_matrix: [[88, 12], [28, 72]],
      test_samples: 200,
      class_distribution: { '0': 100, '1': 100 },
    },
    {
      target: 'LCX',
      accuracy: 0.79,
      precision: 0.73,
      recall: 0.68,
      f1_score: 0.70,
      roc_auc: 0.84,
      confusion_matrix: [[90, 10], [32, 68]],
      test_samples: 200,
      class_distribution: { '0': 100, '1': 100 },
    },
    {
      target: 'RCA',
      accuracy: 0.77,
      precision: 0.71,
      recall: 0.65,
      f1_score: 0.68,
      roc_auc: 0.82,
      confusion_matrix: [[92, 8], [35, 65]],
      test_samples: 200,
      class_distribution: { '0': 100, '1': 100 },
    },
  ],
  evaluation_methodology: "Stratified train/test split (80/20) with 5-fold cross-validation on training set. Models selected based on F1-score for handling class imbalance.",
  dataset_split: { train: 0.8, test: 0.2 },
  disclaimer: "Model performance metrics are based on the training dataset only. Not clinically validated."
}

const mockROCData = [
  { name: 'CAD', data: [{ fpr: 0, tpr: 0 }, { fpr: 0.1, tpr: 0.65 }, { fpr: 0.2, tpr: 0.78 }, { fpr: 0.3, tpr: 0.85 }, { fpr: 0.4, tpr: 0.9 }, { fpr: 0.5, tpr: 0.92 }, { fpr: 0.6, tpr: 0.94 }, { fpr: 0.7, tpr: 0.96 }, { fpr: 0.8, tpr: 0.97 }, { fpr: 0.9, tpr: 0.98 }, { fpr: 1, tpr: 1 }], color: '#2563EB', auc: 0.91 },
  { name: 'LAD', data: [{ fpr: 0, tpr: 0 }, { fpr: 0.1, tpr: 0.58 }, { fpr: 0.2, tpr: 0.72 }, { fpr: 0.3, tpr: 0.8 }, { fpr: 0.4, tpr: 0.85 }, { fpr: 0.5, tpr: 0.88 }, { fpr: 0.6, tpr: 0.91 }, { fpr: 0.7, tpr: 0.93 }, { fpr: 0.8, tpr: 0.95 }, { fpr: 0.9, tpr: 0.97 }, { fpr: 1, tpr: 1 }], color: '#DC2626', auc: 0.87 },
  { name: 'LCX', data: [{ fpr: 0, tpr: 0 }, { fpr: 0.1, tpr: 0.52 }, { fpr: 0.2, tpr: 0.68 }, { fpr: 0.3, tpr: 0.75 }, { fpr: 0.4, tpr: 0.81 }, { fpr: 0.5, tpr: 0.85 }, { fpr: 0.6, tpr: 0.88 }, { fpr: 0.7, tpr: 0.91 }, { fpr: 0.8, tpr: 0.94 }, { fpr: 0.9, tpr: 0.96 }, { fpr: 1, tpr: 1 }], color: '#0D9488', auc: 0.84 },
  { name: 'RCA', data: [{ fpr: 0, tpr: 0 }, { fpr: 0.1, tpr: 0.48 }, { fpr: 0.2, tpr: 0.62 }, { fpr: 0.3, tpr: 0.71 }, { fpr: 0.4, tpr: 0.78 }, { fpr: 0.5, tpr: 0.82 }, { fpr: 0.6, tpr: 0.86 }, { fpr: 0.7, tpr: 0.89 }, { fpr: 0.8, tpr: 0.92 }, { fpr: 0.9, tpr: 0.95 }, { fpr: 1, tpr: 1 }], color: '#D97706', auc: 0.82 },
]

export function ModelPerformancePage() {
  const [metrics, setMetrics] = useState<ModelPerformanceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const res = await api.getModelMetrics()
      setMetrics(res)
    } catch (err) {
      console.warn('Using demo data:', err)
      setMetrics(mockMetrics)
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

  const displayMetrics = metrics || mockMetrics
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'roc', label: 'ROC Curves', icon: <Target className="w-4 h-4" /> },
    { id: 'confusion', label: 'Confusion Matrices', icon: <Brain className="w-4 h-4" /> },
    { id: 'methodology', label: 'Methodology', icon: <Info className="w-4 h-4" /> },
  ]

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              Model Performance
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive evaluation metrics for all prediction targets</p>
          </div>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample model performance metrics. Train models and connect backend to see real evaluation results." className="mb-6" />
        )}

        <Alert type="warning" className="mb-6">
          <Flex gap={3} align="start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Not Clinically Validated</p>
              <p className="mt-1 text-amber-800 text-sm">
                These metrics are based on the Z-Alizadeh Sani dataset only. Models have not been externally validated, 
                FDA-approved, or reviewed by medical professionals. Performance on real-world clinical data may differ significantly.
              </p>
            </div>
          </Flex>
        </Alert>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Metrics Summary */}
            <Grid cols={4} gap="lg" className="mb-8">
              {displayMetrics.metrics.map((metric) => (
                <Card key={metric.target} className="h-full">
                  <CardBody className="p-6">
                    <Flex justify="between" align="start" className="mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{metric.target}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{metric.test_samples} test samples</p>
                      </div>
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', 
                        metric.f1_score >= 0.8 ? 'bg-green-100 text-green-600' :
                        metric.f1_score >= 0.7 ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600')}>
                        <span className="font-bold">{Math.round(metric.f1_score * 100)}</span>
                      </div>
                    </Flex>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Accuracy', value: metric.accuracy, color: '#2563EB' },
                        { label: 'Precision', value: metric.precision, color: '#0D9488' },
                        { label: 'Recall', value: metric.recall, color: '#D97706' },
                        { label: 'F1-Score', value: metric.f1_score, color: '#9333EA' },
                        { label: 'ROC-AUC', value: metric.roc_auc || 0, color: '#DC2626' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 w-24">{item.label}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.value * 100}%`, backgroundColor: item.color }}
                            />
                          </div>
                          <span className={cn('text-sm font-mono font-medium w-12 text-right', 
                            item.value >= 0.8 ? 'text-green-600' :
                            item.value >= 0.7 ? 'text-amber-600' :
                            'text-red-600')}>
                            {(item.value * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Grid>

            {/* Class Distribution */}
            <Grid cols={2} gap="lg" className="mb-8">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Test Set Class Distribution</h3>
                </CardHeader>
                <CardBody>
                  <BarChartComponent
                    data={displayMetrics.metrics.flatMap(m => 
                      Object.entries(m.class_distribution).map(([cls, count]) => ({
                        target: m.target,
                        class: cls === '1' ? 'Positive' : 'Negative',
                        count,
                      }))
                    )}
                    xKey="target"
                    bars={[
                      { key: 'count', name: 'Negative', color: '#9CA3AF' },
                    ]}
                    height={300}
                    horizontal={true}
                  />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Metric Comparison</h3>
                </CardHeader>
<CardBody>
                    <BarChartComponent
                      data={displayMetrics.metrics.map(m => ({
                        target: m.target,
                        accuracy: m.accuracy,
                        precision: m.precision,
                        recall: m.recall,
                        f1: m.f1_score,
                      }))}
                      xKey="target"
                      bars={[
                        { key: 'accuracy', name: 'Accuracy', color: '#2563EB' },
                        { key: 'precision', name: 'Precision', color: '#0D9488' },
                        { key: 'recall', name: 'Recall', color: '#D97706' },
                        { key: 'f1', name: 'F1-Score', color: '#9333EA' },
                      ]}
                      height={300}
                    />
                  </CardBody>
              </Card>
            </Grid>
          </>
        )}

        {/* ROC Curves Tab */}
        {activeTab === 'roc' && (
          <Section title="ROC Curves" description="Receiver Operating Characteristic curves for all targets. AUC values indicate discriminative ability.">
            <Card>
              <CardBody>
                <ROCChartComponent curves={mockROCData} height={400} />
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockROCData.map((curve) => (
                    <div key={curve.name} className="p-4 rounded-lg bg-gray-50 text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: curve.color }} />
                      <p className="font-semibold text-gray-900">{curve.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{curve.auc.toFixed(3)}</p>
                      <p className="text-xs text-gray-500">AUC</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Section>
        )}

        {/* Confusion Matrices Tab */}
        {activeTab === 'confusion' && (
          <Section title="Confusion Matrices" description="True Positive, False Positive, True Negative, False Negative counts for each target.">
            <Grid cols={2} gap="lg">
              {displayMetrics.metrics.map((metric) => (
                <Card key={metric.target}>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900">{metric.target} Confusion Matrix</h3>
                  </CardHeader>
                  <CardBody>
                    <ConfusionMatrixComponent
                      matrix={metric.confusion_matrix}
                      labels={['Negative', 'Positive']}
                    />
                    <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-green-50">
                        <p className="text-2xl font-bold text-green-700">{metric.confusion_matrix[0][0]}</p>
                        <p className="text-xs text-gray-500">True Negative</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50">
                        <p className="text-2xl font-bold text-red-700">{metric.confusion_matrix[0][1]}</p>
                        <p className="text-xs text-gray-500">False Positive</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-50">
                        <p className="text-2xl font-bold text-red-700">{metric.confusion_matrix[1][0]}</p>
                        <p className="text-xs text-gray-500">False Negative</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50">
                        <p className="text-2xl font-bold text-green-700">{metric.confusion_matrix[1][1]}</p>
                        <p className="text-xs text-gray-500">True Positive</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {/* Methodology Tab */}
        {activeTab === 'methodology' && (
          <Section title="Evaluation Methodology" description="Detailed description of the model training and evaluation process.">
            <Grid cols={2} gap="lg">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Training & Validation</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Data Split</h4>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>Stratified 80/20 train/test split preserving class distributions</li>
                        <li>Random seed fixed for reproducibility (seed=42)</li>
                        <li>Separate splits per target to handle different class balances</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Preprocessing</h4>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>Numerical features: Median imputation + Standard scaling</li>
                        <li>Categorical features: Mode imputation + Label encoding</li>
                        <li>Pipeline fitted only on training data (no data leakage)</li>
                        <li>Target leakage prevention: Excluded CAD, LAD, LCX, RCA, Cath from features</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Model Selection</h4>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
                        <li>Algorithms: Random Forest, Gradient Boosting, Logistic Regression</li>
                        <li>Selection criterion: F1-score (handles class imbalance)</li>
                        <li>5-fold stratified cross-validation on training set</li>
                        <li>Best model per target saved independently</li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Target Definitions</h3>
                </CardHeader>
                <CardBody>
                  <Table
                    columns={[
                      { key: 'target', header: 'Target' },
                      { key: 'definition', header: 'Definition' },
                    ]}
                    data={[
                      { target: 'CAD', definition: 'Overall coronary artery disease presence (any vessel with ≥50% stenosis)' },
                      { target: 'LAD', definition: 'Left Anterior Descending artery stenosis ≥50%' },
                      { target: 'LCX', definition: 'Left Circumflex artery stenosis ≥50%' },
                      { target: 'RCA', definition: 'Right Coronary Artery stenosis ≥50%' },
                    ]}
                    keyExtractor={(row) => row.target}
                  />
                </CardBody>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Limitations & Caveats</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Single-center dataset (Z-Alizadeh Sani) — limited generalizability</li>
                    <li>Class imbalance present in some targets — metrics may be optimistic</li>
                    <li>No external validation cohort — performance may not translate to other populations</li>
                    <li>Feature set limited to clinical/echocardiographic variables — no imaging or genomic data</li>
                    <li>Binary classification only — does not predict severity gradation</li>
                    <li>Research prototype only — NOT for clinical use</li>
                  </ul>
                </CardBody>
              </Card>
            </Grid>
          </Section>
        )}
      </Container>
  )
}