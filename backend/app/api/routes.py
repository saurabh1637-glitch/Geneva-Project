from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.database import Patient, Analysis, Report
from app.schemas import (
    PatientCreate, PatientResponse, PatientListResponse,
    PatientInput, PredictionResponse, AnalysisCreate, AnalysisResponse,
    ModelPerformanceResponse, DatasetSummary, HealthResponse,
    ReportResponse, ErrorResponse
)
from app.ml import ml_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    health = ml_service.health_check()
    return HealthResponse(
        status=health['status'],
        version="1.0.0",
        model_loaded=health['model_loaded'],
        dataset_loaded=health['dataset_loaded']
    )


@router.get("/dataset/summary", response_model=DatasetSummary)
async def get_dataset_summary():
    """Get dataset overview and statistics"""
    if not ml_service.dataset_loaded:
        summary = ml_service.load_dataset()
        if 'error' in summary:
            raise HTTPException(status_code=500, detail=f"Failed to load dataset: {summary['error']}")
    else:
        summary = ml_service.dataset_summary
    
    return DatasetSummary(**summary)


@router.post("/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient record"""
    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/patients", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List patients with pagination and search"""
    query = db.query(Patient)
    
    if search:
        query = query.filter(Patient.patient_id.contains(search))
    
    total = query.count()
    patients = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return PatientListResponse(
        patients=patients,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get a specific patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/predict", response_model=PredictionResponse)
async def predict_risk(input_data: PatientInput):
    """Predict cardiovascular risk for a patient"""
    if not ml_service.is_loaded:
        if not ml_service.load_models():
            raise HTTPException(
                status_code=503, 
                detail="Models not available. Please train models first."
            )
    
    # Convert input to dict
    data = input_data.model_dump()
    
    # Make prediction
    result = ml_service.predict(data)
    
    if 'error' in result:
        raise HTTPException(status_code=500, detail=result['error'])
    
    predictions = result['predictions']
    
    return PredictionResponse(
        cad_prediction=predictions.get('CAD', {}).get('prediction', 0),
        lad_prediction=predictions.get('LAD', {}).get('prediction', 0),
        lcx_prediction=predictions.get('LCX', {}).get('prediction', 0),
        rca_prediction=predictions.get('RCA', {}).get('prediction', 0),
        cad_probability=predictions.get('CAD', {}).get('probability', 0.0),
        lad_probability=predictions.get('LAD', {}).get('probability', 0.0),
        lcx_probability=predictions.get('LCX', {}).get('probability', 0.0),
        rca_probability=predictions.get('RCA', {}).get('probability', 0.0),
        feature_contributions=result.get('feature_contributions'),
        model_version=result.get('model_version', '1.0.0')
    )


@router.post("/analyses", response_model=AnalysisResponse)
async def create_analysis(analysis: AnalysisCreate, db: Session = Depends(get_db)):
    """Create analysis record with prediction"""
    # Get or create patient
    patient = db.query(Patient).filter(Patient.patient_id == analysis.patient_id).first()
    if not patient:
        patient = Patient(patient_id=analysis.patient_id)
        db.add(patient)
        db.commit()
        db.refresh(patient)
    
    # Make prediction
    input_dict = analysis.input_data.model_dump()
    result = ml_service.predict(input_dict)
    
    if 'error' in result:
        raise HTTPException(status_code=500, detail=result['error'])
    
    predictions = result['predictions']
    
    # Create analysis record
    db_analysis = Analysis(
        patient_id=patient.id,
        input_data=input_dict,
        cad_prediction=predictions.get('CAD', {}).get('prediction', 0),
        lad_prediction=predictions.get('LAD', {}).get('prediction', 0),
        lcx_prediction=predictions.get('LCX', {}).get('prediction', 0),
        rca_prediction=predictions.get('RCA', {}).get('prediction', 0),
        cad_probability=predictions.get('CAD', {}).get('probability', 0.0),
        lad_probability=predictions.get('LAD', {}).get('probability', 0.0),
        lcx_probability=predictions.get('LCX', {}).get('probability', 0.0),
        rca_probability=predictions.get('RCA', {}).get('probability', 0.0),
        feature_contributions=result.get('feature_contributions'),
        model_version=result.get('model_version', '1.0.0')
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return db_analysis


@router.get("/analyses", response_model=List[AnalysisResponse])
async def list_analyses(
    patient_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List analyses"""
    query = db.query(Analysis)
    
    if patient_id:
        query = query.filter(Analysis.patient_id == patient_id)
    
    analyses = query.order_by(Analysis.created_at.desc()).limit(limit).all()
    return analyses


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    """Get a specific analysis"""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/models/metrics", response_model=ModelPerformanceResponse)
async def get_model_metrics():
    """Get model performance metrics"""
    if not ml_service.is_loaded:
        if not ml_service.load_models():
            raise HTTPException(
                status_code=503,
                detail="Models not available. Please train models first."
            )
    
    metrics_data = ml_service.get_metrics()
    
    if 'error' in metrics_data:
        raise HTTPException(status_code=500, detail=metrics_data['error'])
    
    metrics_list = []
    for target, metrics in metrics_data.get('metrics', {}).items():
        metrics_list.append({
            'target': target,
            'accuracy': metrics.get('accuracy', 0),
            'precision': metrics.get('precision', 0),
            'recall': metrics.get('recall', 0),
            'f1_score': metrics.get('f1_score', 0),
            'roc_auc': metrics.get('roc_auc'),
            'confusion_matrix': metrics.get('confusion_matrix', [[0, 0], [0, 0]]),
            'test_samples': metrics.get('test_samples', 0),
            'class_distribution': metrics.get('class_distribution', {})
        })
    
    return ModelPerformanceResponse(
        metrics=metrics_list,
        evaluation_methodology="Stratified train/test split (80/20) with 5-fold cross-validation on training set. Models selected based on F1-score for handling class imbalance.",
        dataset_split={"train": 0.8, "test": 0.2}
    )


@router.get("/explainability/{target}")
async def get_explainability(target: str, patient_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get SHAP explainability for a prediction"""
    if target not in ['CAD', 'LAD', 'LCX', 'RCA']:
        raise HTTPException(status_code=400, detail="Invalid target. Must be one of: CAD, LAD, LCX, RCA")
    
    if not ml_service.is_loaded:
        if not ml_service.load_models():
            raise HTTPException(status_code=503, detail="Models not loaded")
    
    input_data = {}
    if patient_id:
        analysis = db.query(Analysis).filter(Analysis.id == patient_id).first()
        if analysis:
            input_data = analysis.input_data
    
    explanation = ml_service.get_shap_explanation(input_data, target)
    
    if 'error' in explanation:
        # Fallback to feature importance
        metrics_data = ml_service.get_metrics()
        if 'feature_importance' in metrics_data and target in metrics_data['feature_importance']:
            return {
                'target': target,
                'method': 'feature_importance',
                'feature_importance': metrics_data['feature_importance'][target],
                'note': 'SHAP values not available. Showing model feature importance instead.'
            }
        raise HTTPException(status_code=500, detail=explanation['error'])
    
    return explanation


@router.post("/reports/{analysis_id}/pdf")
async def generate_report(analysis_id: int, db: Session = Depends(get_db)):
    """Generate PDF report for an analysis"""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Import here to avoid circular imports
    from app.services.report_generator import generate_pdf_report
    
    try:
        pdf_path = generate_pdf_report(analysis)
        
        # Save report record
        report = Report(analysis_id=analysis_id, pdf_path=pdf_path)
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {"pdf_path": pdf_path, "report_id": report.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


@router.get("/reports/{analysis_id}/pdf")
async def get_report(analysis_id: int, db: Session = Depends(get_db)):
    """Get report for an analysis"""
    report = db.query(Report).filter(Report.analysis_id == analysis_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report