// API Types
export interface Patient {
  id: number;
  patient_id: string;
  age: number | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  page_size: number;
}

export interface PatientInput {
  age: number;
  gender: number;
  cp: number;
  trestbps: number;
  chol: number;
  fbs: number;
  restecg: number;
  thalach: number;
  exang: number;
  oldpeak: number;
  slope: number;
  ca: number;
  thal: number;
  weight?: number;
  height?: number;
  bmi?: number;
  dm?: number;
  htn?: number;
  current_smoker?: number;
  ex_smoker?: number;
  fh?: number;
  obesity?: number;
  crf?: number;
  crl?: number;
  htn_type?: number;
  dm_type?: number;
  dm_dur?: number;
  bp_systolic?: number;
  bp_diastolic?: number;
  pr?: number;
  pp?: number;
  edv?: number;
  esv?: number;
  ef?: number;
  lv_mass?: number;
  region_rwma?: number;
  lvh?: number;
  cat?: number;
}

export interface PredictionResponse {
  cad_prediction: number;
  lad_prediction: number;
  lcx_prediction: number;
  rca_prediction: number;
  cad_probability: number;
  lad_probability: number;
  lcx_probability: number;
  rca_probability: number;
  feature_contributions?: Record<string, Record<string, number>>;
  model_version: string;
  disclaimer: string;
}

export interface Analysis {
  id: number;
  patient_id: string;
  input_data: PatientInput;
  cad_prediction: number;
  lad_prediction: number;
  lcx_prediction: number;
  rca_prediction: number;
  cad_probability: number;
  lad_probability: number;
  lcx_probability: number;
  rca_probability: number;
  feature_contributions?: Record<string, Record<string, number>>;
  model_version: string;
  created_at: string;
}

export interface ModelMetric {
  target: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number | null;
  confusion_matrix: number[][];
  test_samples: number;
  class_distribution: Record<string, number>;
}

export interface ModelPerformanceResponse {
  metrics: ModelMetric[];
  evaluation_methodology: string;
  dataset_split: Record<string, number>;
  disclaimer: string;
}

export interface DatasetSummary {
  total_samples: number;
  features: string[];
  target_columns: string[];
  missing_values: Record<string, number>;
  target_distribution: Record<string, Record<string, number>>;
  categorical_features: string[];
  numerical_features: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
  dataset_loaded: boolean;
  targets_available?: string[];
}

export interface ExplainabilityResponse {
  target: string;
  shap_values?: number[];
  feature_names?: string[];
  base_value?: number;
  method?: string;
  feature_importance?: Record<string, number>;
  note?: string;
  error?: string;
}

export interface ReportResponse {
  id: number;
  analysis_id: number;
  pdf_path: string;
  generated_at: string;
}

// Form Types
export interface FormFieldConfig {
  name: keyof PatientInput;
  label: string;
  type: 'number' | 'select' | 'text';
  required: boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: number; label: string }[];
  description?: string;
  group: string;
}

// UI Types
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'teal' | 'amber' | 'red' | 'purple';
}

// Chart Types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}