import os
import joblib
import pandas as pd
from typing import Optional, Dict, Any
from pathlib import Path

from app.ml.data_processor import ZAlizadehSaniProcessor, load_and_process_dataset
from app.ml.trainer import ModelTrainer, train_pipeline
from app.core.config import settings


class MLModelService:
    """Service to manage ML models for inference"""
    
    def __init__(self):
        self.processor: Optional[ZAlizadehSaniProcessor] = None
        self.trainer: Optional[ModelTrainer] = None
        self.is_loaded: bool = False
        self.dataset_loaded: bool = False
        self.dataset_summary: Dict[str, Any] = {}
        
    def load_dataset(self) -> Dict[str, Any]:
        """Load and explore the dataset"""
        try:
            self.processor, self.dataset_summary = load_and_process_dataset(settings.DATASET_PATH)
            self.dataset_loaded = True
            return self.dataset_summary
        except Exception as e:
            print(f"Failed to load dataset: {e}")
            self.dataset_loaded = False
            return {'error': str(e)}
    
    def load_models(self) -> bool:
        """Load trained models and preprocessor"""
        try:
            model_path = settings.MODEL_PATH
            preprocessor_path = settings.PREPROCESSOR_PATH
            
            if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
                print("Model files not found. Please train models first.")
                return False
            
            # Load preprocessor
            self.processor = ZAlizadehSaniProcessor(settings.DATASET_PATH)
            self.processor.load_preprocessor(preprocessor_path)
            
            # Load models
            self.trainer = ModelTrainer(self.processor)
            self.trainer.load_models(model_path)
            
            self.is_loaded = True
            print("Models loaded successfully")
            return True
            
        except Exception as e:
            print(f"Failed to load models: {e}")
            self.is_loaded = False
            return False
    
    def train_models(self) -> Dict[str, Any]:
        """Train new models"""
        try:
            self.trainer = train_pipeline(settings.DATASET_PATH, settings.MODEL_DIR)
            self.is_loaded = True
            return {'status': 'success', 'metrics': self.trainer.metrics}
        except Exception as e:
            print(f"Training failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make predictions for a single patient"""
        if not self.is_loaded or self.trainer is None:
            return {'error': 'Models not loaded'}
        
        try:
            # Create DataFrame from input
            df = pd.DataFrame([input_data])
            
            # Ensure all required features are present
            for col in self.processor.feature_columns:
                if col not in df.columns:
                    df[col] = None
            
            # Reorder columns to match training
            df = df[self.processor.feature_columns]
            
            # Get predictions
            predictions = self.trainer.predict(df)
            
            # Get feature contributions (SHAP or feature importance)
            feature_contributions = {}
            if self.trainer.feature_importance:
                # Use feature importance as proxy for contributions
                for target in ['CAD', 'LAD', 'LCX', 'RCA']:
                    if target in self.trainer.feature_importance:
                        feature_contributions[target] = self.trainer.feature_importance[target]
            
            return {
                'predictions': predictions,
                'feature_contributions': feature_contributions,
                'model_version': '1.0.0'
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return {'error': str(e)}
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get model performance metrics"""
        if not self.is_loaded or self.trainer is None:
            return {'error': 'Models not loaded'}
        
        return {
            'metrics': self.trainer.metrics,
            'feature_importance': self.trainer.feature_importance
        }
    
    def get_shap_explanation(self, input_data: Dict[str, Any], target: str) -> Dict[str, Any]:
        """Get SHAP explanation for a prediction"""
        if not self.is_loaded or self.trainer is None:
            return {'error': 'Models not loaded'}
        
        try:
            df = pd.DataFrame([input_data])
            for col in self.processor.feature_columns:
                if col not in df.columns:
                    df[col] = None
            df = df[self.processor.feature_columns]
            
            shap_values = self.trainer.get_shap_values(df, target)
            
            if shap_values is not None:
                feature_names = self.processor.get_feature_names()
                return {
                    'target': target,
                    'shap_values': shap_values[0].tolist() if len(shap_values.shape) > 1 else shap_values.tolist(),
                    'feature_names': feature_names,
                    'base_value': float(shap_values.mean()) if hasattr(shap_values, 'mean') else 0.0
                }
            else:
                return {'error': 'SHAP not available for this model'}
                
        except Exception as e:
            return {'error': str(e)}
    
    def health_check(self) -> Dict[str, Any]:
        """Health check endpoint"""
        return {
            'status': 'healthy' if self.is_loaded else 'degraded',
            'model_loaded': self.is_loaded,
            'dataset_loaded': self.dataset_loaded,
            'targets_available': list(self.trainer.models.keys()) if self.trainer else []
        }


# Global instance
ml_service = MLModelService()