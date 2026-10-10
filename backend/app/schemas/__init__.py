from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PatientBase(BaseModel):
    patient_id: str
    age: Optional[float] = None
    gender: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    total: int
    page: int
    page_size: int


class PatientInput(BaseModel):
    age: float = Field(..., ge=0, le=120)
    gender: int = Field(..., ge=0, le=1)
    cp: int = Field(..., ge=0, le=3)
    trestbps: float = Field(..., ge=50, le=250)
    chol: float = Field(..., ge=50, le=600)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: float = Field(..., ge=50, le=250)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=0, le=10)
    slope: int = Field(..., ge=0, le=2)
    ca: int = Field(..., ge=0, le=3)
    thal: int = Field(..., ge=0, le=3)
    
    # Additional features from Z-Alizadeh Sani dataset
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    dm: Optional[int] = None
    htn: Optional[int] = None
    current_smoker: Optional[int] = None
    ex_smoker: Optional[int] = None
    fh: Optional[int] = None
    obesity: Optional[int] = None
    crf: Optional[int] = None
    crl: Optional[int] = None
    htn_type: Optional[int] = None
    dm_type: Optional[int] = None
    dm_dur: Optional[float] = None
    bp_systolic: Optional[float] = None
    bp_diastolic: Optional[float] = None
    pr: Optional[float] = None
    pp: Optional[float] = None
    edv: Optional[float] = None
    esv: Optional[float] = None
    ef: Optional[float] = None
    lv_mass: Optional[float] = None
    region_rwma: Optional[int] = None
    lvh: Optional[int] = None
    cat: Optional[float] = None


class PredictionResponse(BaseModel):
    cad_prediction: int
    lad_prediction: int
    lcx_prediction: int
    rca_prediction: int
    cad_probability: float
    lad_probability: float
    lcx_probability: float
    rca_probability: float
    feature_contributions: Optional[Dict[str, float]] = None
    model_version: str
    disclaimer: str = "For research and educational use only. Not a substitute for professional medical diagnosis."


class AnalysisCreate(BaseModel):
    patient_id: str
    input_data: PatientInput


class AnalysisResponse(BaseModel):
    id: int
    patient_id: str
    input_data: Dict[str, Any]
    cad_prediction: int
    lad_prediction: int
    lcx_prediction: int
    rca_prediction: int
    cad_probability: float
    lad_probability: float
    lcx_probability: float
    rca_probability: float
    feature_contributions: Optional[Dict[str, float]] = None
    model_version: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ModelMetrics(BaseModel):
    target: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    confusion_matrix: List[List[int]]
    test_samples: int
    class_distribution: Dict[str, int]


class ModelPerformanceResponse(BaseModel):
    metrics: List[ModelMetrics]
    evaluation_methodology: str
    dataset_split: Dict[str, float]
    disclaimer: str = "Model performance metrics are based on the training dataset only. Not clinically validated."


class DatasetSummary(BaseModel):
    total_samples: int
    features: List[str]
    target_columns: List[str]
    missing_values: Dict[str, int]
    target_distribution: Dict[str, Dict[str, int]]
    categorical_features: List[str]
    numerical_features: List[str]


class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    dataset_loaded: bool


class ReportResponse(BaseModel):
    id: int
    analysis_id: int
    pdf_path: str
    generated_at: datetime
    
    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None