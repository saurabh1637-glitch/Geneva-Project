'use client'

import { useEffect, useState } from 'react'

import { api } from '../services/api'
import { handleApiError } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { Table, Badge, Alert } from '../components/ui/DataDisplayComponents'
import { Tabs } from '../components/ui/FormComponents'
import { Container, Section, Grid, Flex } from '../components/ui/LayoutComponents'
import { PieChartComponent, BarChartComponent } from '../components/charts/ChartComponents'
import { Database, AlertCircle, Info, Filter, Search, ChevronDown, ChevronUp, Eye, Download } from 'lucide-react'
import { cn, formatFieldName } from '../utils/helpers'
import type { DatasetSummary } from '../types'

const mockDataset: DatasetSummary = {
  total_samples: 303,
  features: [
    'age', 'gender', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal',
    'weight', 'height', 'bmi', 'dm', 'htn', 'current_smoker', 'ex_smoker', 'fh', 'obesity', 'crf', 'crl',
    'htn_type', 'dm_type', 'dm_dur', 'bp_systolic', 'bp_diastolic', 'pr', 'pp', 'edv', 'esv', 'ef', 'lv_mass',
    'region_rwma', 'lvh', 'cat'
  ],
  target_columns: ['CAD', 'LAD', 'LCX', 'RCA', 'Cath'],
  missing_values: {
    'age': 0, 'gender': 0, 'cp': 0, 'trestbps': 0, 'chol': 0, 'fbs': 0, 'restecg': 0,
    'thalach': 0, 'exang': 0, 'oldpeak': 0, 'slope': 0, 'ca': 4, 'thal': 2,
    'weight': 12, 'height': 12, 'bmi': 12, 'dm': 0, 'htn': 0, 'current_smoker': 0,
    'ex_smoker': 0, 'fh': 0, 'obesity': 0, 'crf': 0, 'crl': 0, 'htn_type': 45,
    'dm_type': 45, 'dm_dur': 45, 'bp_systolic': 8, 'bp_diastolic': 8, 'pr': 8, 'pp': 8,
    'edv': 25, 'esv': 25, 'ef': 25, 'lv_mass': 25, 'region_rwma': 25, 'lvh': 25, 'cat': 0,
  },
  target_distribution: {
    CAD: { '0': 138, '1': 165 },
    LAD: { '0': 180, '1': 123 },
    LCX: { '0': 210, '1': 93 },
    RCA: { '0': 220, '1': 83 },
    Cath: { '0': 150, '1': 153 },
  },
  categorical_features: ['gender', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal', 'dm', 'htn', 'current_smoker', 'ex_smoker', 'fh', 'obesity', 'crf', 'crl', 'htn_type', 'dm_type', 'region_rwma', 'lvh'],
  numerical_features: ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'weight', 'height', 'bmi', 'dm_dur', 'bp_systolic', 'bp_diastolic', 'pr', 'pp', 'edv', 'esv', 'ef', 'lv_mass', 'cat'],
}

const featureGroups = [
  { name: 'Demographics', features: ['age', 'gender', 'weight', 'height', 'bmi'], description: 'Basic patient demographic information' },
  { name: 'Clinical Examination', features: ['cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'], description: 'Standard clinical and ECG measurements' },
  { name: 'Comorbidities', features: ['dm', 'htn', 'current_smoker', 'ex_smoker', 'fh', 'obesity', 'crf', 'crl', 'htn_type', 'dm_type', 'dm_dur'], description: 'Coexisting medical conditions and risk factors' },
  { name: 'Echocardiography', features: ['bp_systolic', 'bp_diastolic', 'pr', 'pp', 'edv', 'esv', 'ef', 'lv_mass', 'region_rwma', 'lvh'], description: 'Echocardiographic measurements' },
  { name: 'Other', features: ['cat'], description: 'Additional measurements' },
]

export function DatasetPage() {
  const [dataset, setDataset] = useState<DatasetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'targets' | 'preprocessing' | 'limitations'>('overview')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [isDemoData, setIsDemoData] = useState(false)

  useEffect(() => {
    loadDataset()
  }, [])

  const loadDataset = async () => {
    try {
      setLoading(true)
      const res = await api.getDatasetSummary()
      setDataset(res)
    } catch (err) {
      console.warn('Using demo data:', err)
      setDataset(mockDataset)
      setIsDemoData(true)
    } finally {
      setLoading(false)
    }
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
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

  const data = dataset || mockDataset

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Database className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Filter className="w-4 h-4" /> },
    { id: 'targets', label: 'Targets', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'preprocessing', label: 'Preprocessing', icon: <Info className="w-4 h-4" /> },
    { id: 'limitations', label: 'Limitations', icon: <AlertCircle className="w-4 h-4" /> },
  ]

  return (
    <Container size="xl">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-600" />
              Dataset & Methodology
            </h1>
            <p className="text-gray-600 mt-1">Z-Alizadeh Sani Coronary Artery Disease Dataset documentation</p>
          </div>
        </Flex>

        {isDemoData && (
          <Alert type="info" title="Demo Data" message="Showing sample dataset information. Connect to backend to view actual dataset statistics." className="mb-6" />
        )}

        <Alert type="warning" className="mb-6">
          <Flex gap={3} align="start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Research Dataset</p>
              <p className="mt-1 text-amber-800 text-sm">
                The Z-Alizadeh Sani dataset is a single-center research dataset. 
                Models trained on this data may not generalize to other populations. 
                All findings should be interpreted as research observations only.
              </p>
            </div>
          </Flex>
        </Alert>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id: string) => setActiveTab(id as "overview" | "features" | "targets" | "preprocessing" | "limitations")} className="mb-6" />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Summary Cards */}
            <Grid cols={4} gap="lg" className="mb-8">
              <Card>
                <CardBody className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.total_samples}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Samples</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-8 h-8 text-teal-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.features.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Features</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{data.target_columns.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Target Columns</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{Object.values(data.missing_values).reduce((a, b) => a + b, 0)}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Missing Values</p>
                </CardBody>
              </Card>
            </Grid>

            {/* Missing Values Chart */}
            <Grid cols={2} gap="lg" className="mb-8">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Missing Values by Feature</h3>
                </CardHeader>
<CardBody>
                   <BarChartComponent
                     data={Object.entries(data.missing_values)
                       .filter(([, v]) => v > 0)
                       .sort(([, a], [, b]) => b - a)
                       .slice(0, 15)
                       .map(([feature, missing]) => ({
                         feature: formatFieldName(feature),
                         missing,
                       }))}
                     xKey="feature"
                     bars={[{ key: 'missing', name: 'Missing Count', color: '#DC2626' }]}
                     height={350}
                     horizontal={true}
                   />
                 </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Feature Types</h3>
                </CardHeader>
<CardBody>
                   <PieChartComponent
                     data={[
                       { name: 'Numerical', value: data.numerical_features.length, color: '#2563EB' },
                       { name: 'Categorical', value: data.categorical_features.length, color: '#0D9488' },
                     ]}
                     height={350}
                   />
                   <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                     <div className="p-3 rounded-lg bg-blue-50">
                       <p className="text-2xl font-bold text-blue-600">{data.numerical_features.length}</p>
                       <p className="text-sm text-gray-500">Numerical Features</p>
                     </div>
                     <div className="p-3 rounded-lg bg-teal-50">
                       <p className="text-2xl font-bold text-teal-600">{data.categorical_features.length}</p>
                       <p className="text-sm text-gray-500">Categorical Features</p>
                     </div>
                   </div>
                 </CardBody>
              </Card>
            </Grid>

            {/* Dataset Citation */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Dataset Citation
                </h3>
              </CardHeader>
              <CardBody>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm text-gray-700 whitespace-pre-wrap">
Z-Alizadeh Sani, S. (2018). Coronary Artery Disease Dataset.
UCI Machine Learning Repository. https://doi.org/10.24432/C5V30N
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  This dataset contains clinical, laboratory, and echocardiographic data from patients 
                  undergoing coronary angiography at a single center. Used for Track A of the 
                  IIT Mandi Multimodal AI Hackathon 2026.
                </p>
              </CardBody>
            </Card>
          </>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <Section title="Feature Details" description="All features organized by clinical category">
            {featureGroups.map((group) => {
              const isExpanded = expandedGroups[group.name]
              const groupFeatures = group.features.filter(f => data.features.includes(f))
              
              return (
                <Card key={group.name} className="mb-4">
                  <CardHeader>
                    <Flex justify="between" align="center" onClick={() => toggleGroup(group.name)}>
                      <Flex align="center" gap={3} className="flex-1 cursor-pointer">
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        <Badge variant="blue">{group.features.length} features</Badge>
                      </Flex>
                      <span className={cn('text-gray-400 transition-transform', isExpanded && 'rotate-180')}>
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </Flex>
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardBody className="p-0">
                      <Table
                        columns={[
                          { key: 'feature', header: 'Feature', render: (row: { feature: string; missing: number; type: string }) => (
                            <span className="font-mono text-sm">{row.feature}</span>
                          )},
                          { key: 'type', header: 'Type', render: (row: { feature: string; missing: number; type: string }) => (
                            <Badge variant={row.type === 'Numerical' ? 'blue' : 'teal'} className="text-xs">
                              {row.type}
                            </Badge>
                          )},
                          { key: 'missing', header: 'Missing', render: (row: { feature: string; missing: number; type: string }) => (
                            <Flex align="center" gap={2}>
                              <span className="font-mono">{row.missing}</span>
                              <span className="text-xs text-gray-500">({((row.missing / data.total_samples) * 100).toFixed(1)}%)</span>
                            </Flex>
                          )},
                          { key: 'description', header: 'Description' },
                        ]}
                        data={groupFeatures.map(f => ({
                          feature: f,
                          type: data.categorical_features.includes(f) ? 'Categorical' : 'Numerical',
                          missing: data.missing_values[f] || 0,
                          description: '',
                        }))}
                        keyExtractor={(row) => row.feature}
                      />
                    </CardBody>
                  )}
                </Card>
              )
            })}
          </Section>
        )}

        {/* Targets Tab */}
        {activeTab === 'targets' && (
          <Section title="Target Variables" description="Coronary artery disease prediction targets">
            <Grid cols={2} gap="lg" className="mb-8">
              {Object.entries(data.target_distribution).map(([target, dist]) => (
                <Card key={target}>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900">{target}</h3>
                  </CardHeader>
                  <CardBody>
                    <PieChartComponent
                      data={Object.entries(dist).map(([label, value]) => ({
                        name: label === '1' ? 'Positive' : 'Negative',
                        value,
                        color: label === '1' ? '#DC2626' : '#16A34A',
                      }))}
                      height={250}
                    />
                    <div className="mt-4 space-y-2">
                      {Object.entries(dist).map(([label, value]) => (
                        <Flex key={label} justify="between">
                          <span className={cn('font-medium', label === '1' ? 'text-red-600' : 'text-green-600')}>
                            {label === '1' ? 'Positive' : 'Negative'}
                          </span>
                          <span className="font-mono text-gray-900">
                            {value} ({(value / data.total_samples * 100).toFixed(1)}%)
                          </span>
                        </Flex>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Grid>

            <Card>
              <CardHeader>
                <h3 className="font-semibold text-gray-900">Target Definitions</h3>
              </CardHeader>
              <CardBody>
                <Table
                  columns={[
                    { key: 'target', header: 'Target' },
                    { key: 'definition', header: 'Definition' },
                    { key: 'type', header: 'Type' },
                  ]}
                  data={[
                    { target: 'CAD', definition: 'Overall coronary artery disease presence (any major vessel with ≥50% stenosis)', type: 'Binary (0/1)' },
                    { target: 'LAD', definition: 'Left Anterior Descending artery stenosis ≥50%', type: 'Binary (0/1)' },
                    { target: 'LCX', definition: 'Left Circumflex artery stenosis ≥50%', type: 'Binary (0/1)' },
                    { target: 'RCA', definition: 'Right Coronary Artery stenosis ≥50%', type: 'Binary (0/1)' },
                    { target: 'Cath', definition: 'Catheterization result (angiographic confirmation)', type: 'Binary (0/1)' },
                  ]}
                  keyExtractor={(row) => row.target}
                />
              </CardBody>
            </Card>
          </Section>
        )}

        {/* Preprocessing Tab */}
        {activeTab === 'preprocessing' && (
          <Section title="Preprocessing Pipeline" description="Data transformation steps applied before model training">
            <Grid cols={2} gap="lg">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Numerical Features</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Missing value imputation: Median (robust to outliers)</li>
                    <li>Standardization: Zero mean, unit variance (StandardScaler)</li>
                    <li>Fitted only on training data (no data leakage)</li>
                    <li>Applied to: age, trestbps, chol, thalach, oldpeak, weight, height, bmi, dm_dur, bp_systolic, bp_diastolic, pr, pp, edv, esv, ef, lv_mass, cat</li>
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Categorical Features</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Missing value imputation: Mode (most frequent)</li>
                    <li>Encoding: LabelEncoder (ordinal encoding)</li>
                    <li>Unseen categories mapped to -1 during inference</li>
                    <li>Applied to: gender, cp, fbs, restecg, exang, slope, ca, thal, dm, htn, current_smoker, ex_smoker, fh, obesity, crf, crl, htn_type, dm_type, region_rwma, lvh</li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Target Leakage Prevention</h3>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-gray-600 mb-4">
                    The following columns are EXCLUDED from model input features to prevent target leakage:
                  </p>
                  <Flex gap={2} wrap>
                    {['CAD', 'LAD', 'LCX', 'RCA', 'Cath'].map((col) => (
                      <Badge key={col} variant="red" className="text-sm">{col}</Badge>
                    ))}
                  </Flex>
                  <p className="mt-4 text-sm text-gray-600">
                    This ensures the model predicts from clinical features only, not from the target labels themselves.
                    This is a critical requirement for valid cardiovascular risk prediction.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Train/Test Split</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Stratified 80/20 split per target</li>
                    <li>Random seed: 42 (reproducible)</li>
                    <li>Class distributions preserved in both sets</li>
                    <li>Separate splits for each target due to different class balances</li>
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">Model Training</h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Algorithms: Random Forest, Gradient Boosting, Logistic Regression</li>
                    <li>Selection: Best F1-score per target (handles class imbalance)</li>
                    <li>Cross-validation: 5-fold stratified on training set</li>
                    <li>Hyperparameters: Pre-tuned for clinical data</li>
                    <li>Models saved with joblib for reproducibility</li>
                  </ul>
                </CardBody>
              </Card>
            </Grid>
          </Section>
        )}

        {/* Limitations Tab */}
        {activeTab === 'limitations' && (
          <Section title="Dataset Limitations" description="Important caveats and limitations of the Z-Alizadeh Sani dataset">
            <Grid cols={2} gap="lg">
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Data Limitations
                  </h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Single-center dataset from one hospital in Iran</li>
                    <li>Relatively small sample size (303 patients)</li>
                    <li>Class imbalance in vessel-specific targets (especially RCA, LCX)</li>
                    <li>Missing values in echocardiographic features (up to 8%)</li>
                    <li>No external validation cohort available</li>
                    <li>Demographics may not represent global populations</li>
                    <li>Cross-sectional design — no longitudinal outcomes</li>
                    <li>Angiographic stenosis ≥50% as binary threshold</li>
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-500" />
                    Modeling Caveats
                  </h3>
                </CardHeader>
                <CardBody>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Performance metrics may be optimistic due to small test sets</li>
                    <li>No temporal validation — all data from same time period</li>
                    <li>Feature set limited to available clinical variables</li>
                    <li>No imaging, genomic, or biomarker data included</li>
                    <li>Binary classification only — no severity grading</li>
                    <li>Models not calibrated for clinical probability interpretation</li>
                    <li>Research prototype — NOT for clinical deployment</li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Ethical & Clinical Considerations
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p>
                      <strong>This system is a research prototype developed for the IIT Mandi Multimodal AI Hackathon 2026 (Track A).</strong>
                    </p>
                    <p>
                      Models trained on this dataset have <strong>not been clinically validated</strong>, FDA-approved, 
                      or reviewed by medical professionals. Predictions should <strong>never</strong> be used as a 
                      substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                    <p>
                      Always consult a qualified healthcare provider for any medical concerns or decisions 
                      regarding cardiovascular health. The authors and hackathon organizers assume no 
                      liability for any misuse of this research system.
                    </p>
                    <p>
                      <strong>Data Source:</strong> Z-Alizadeh Sani dataset from UCI Machine Learning Repository. 
                      Original study: Alizadeh Sani et al., "Coronary Artery Disease Diagnosis using 
                      Machine Learning," Computer Methods and Programs in Biomedicine, 2018.
                    </p>
                  </div>
                </CardBody>
              </Card>
            </Grid>
          </Section>
        )}
      </Container>
  )
}