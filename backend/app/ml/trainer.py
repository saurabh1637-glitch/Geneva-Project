import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
from sklearn.model_selection import cross_val_score, StratifiedKFold
import joblib
import warnings
warnings.filterwarnings('ignore')

from app.ml.data_processor import ZAlizadehSaniProcessor


class ModelTrainer:
    """Train and evaluate models for cardiovascular risk prediction"""
    
    TARGETS = ['CAD', 'LAD', 'LCX', 'RCA']
    
    def __init__(self, processor: ZAlizadehSaniProcessor, model_dir: str = "models"):
        self.processor = processor
        self.model_dir = model_dir
        self.models: Dict[str, Any] = {}
        self.metrics: Dict[str, Dict] = {}
        self.feature_importance: Dict[str, Dict[str, float]] = {}
        
    def get_models(self) -> Dict[str, Any]:
        """Get base models to try"""
        return {
            'random_forest': RandomForestClassifier(
                n_estimators=200, max_depth=10, min_samples_split=5,
                min_samples_leaf=2, random_state=42, class_weight='balanced', n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=150, max_depth=5, learning_rate=0.1,
                min_samples_split=5, random_state=42
            ),
            'logistic_regression': LogisticRegression(
                max_iter=1000, class_weight='balanced', random_state=42, n_jobs=-1
            ),
        }
    
    def train_target(self, target: str, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Train models for a specific target and return best model"""
        print(f"\nTraining models for {target}...")
        
        # Split data
        X_train, X_test, y_train, y_test = self.processor.split_data(X, y)
        
        # Transform features
        X_train_transformed = self.processor.fit_transform(X_train)
        X_test_transformed = self.processor.transform(X_test)
        
        # Get feature names
        feature_names = self.processor.get_feature_names()
        
        best_model = None
        best_score = 0
        best_metrics = {}
        best_model_name = ""
        
        models = self.get_models()
        
        for name, model in models.items():
            try:
                print(f"  Training {name}...")
                model.fit(X_train_transformed, y_train)
                
                # Predict
                y_pred = model.predict(X_test_transformed)
                y_prob = model.predict_proba(X_test_transformed)[:, 1] if hasattr(model, 'predict_proba') else y_pred
                
                # Calculate metrics
                metrics = self.calculate_metrics(y_test, y_pred, y_prob)
                metrics['model_name'] = name
                metrics['test_samples'] = len(y_test)
                metrics['class_distribution'] = y_test.value_counts().to_dict()
                
                print(f"    Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1_score']:.4f}, AUC: {metrics.get('roc_auc', 'N/A')}")
                
                # Use F1 as primary metric for imbalanced data
                if metrics['f1_score'] > best_score:
                    best_score = metrics['f1_score']
                    best_model = model
                    best_metrics = metrics
                    best_model_name = name
                    
                    # Store feature importance if available
                    if hasattr(model, 'feature_importances_'):
                        self.feature_importance[target] = dict(zip(feature_names, model.feature_importances_))
                    elif hasattr(model, 'coef_'):
                        self.feature_importance[target] = dict(zip(feature_names, np.abs(model.coef_[0])))
                        
            except Exception as e:
                print(f"    Error training {name}: {e}")
                continue
        
        if best_model is None:
            raise ValueError(f"No model could be trained for {target}")
            
        self.models[target] = best_model
        self.metrics[target] = best_metrics
        
        print(f"  Best model for {target}: {best_model_name} (F1: {best_score:.4f})")
        return {
            'model': best_model,
            'metrics': best_metrics,
            'feature_importance': self.feature_importance.get(target, {})
        }
    
    def calculate_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, 
                         y_prob: np.ndarray) -> Dict[str, float]:
        """Calculate comprehensive metrics"""
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='binary', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='binary', zero_division=0),
            'f1_score': f1_score(y_true, y_pred, average='binary', zero_division=0),
        }
        
        # ROC AUC - handle edge cases
        try:
            if len(np.unique(y_true)) > 1:
                metrics['roc_auc'] = roc_auc_score(y_true, y_prob)
            else:
                metrics['roc_auc'] = None
        except Exception:
            metrics['roc_auc'] = None
            
        # Confusion matrix
        cm = confusion_matrix(y_true, y_pred)
        metrics['confusion_matrix'] = cm.tolist()
        
        return metrics
    
    def train_all_targets(self, X: pd.DataFrame, y_dict: Dict[str, pd.Series]) -> Dict[str, Any]:
        """Train models for all targets"""
        results = {}
        
        for target in self.TARGETS:
            if target in y_dict:
                try:
                    results[target] = self.train_target(target, X, y_dict[target])
                except Exception as e:
                    print(f"Failed to train {target}: {e}")
                    results[target] = {'error': str(e)}
            else:
                print(f"Target {target} not found in dataset")
                results[target] = {'error': 'Target not found'}
                
        return results
    
    def save_models(self, path: str):
        """Save all trained models and preprocessor"""
        import os
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        model_data = {
            'models': self.models,
            'metrics': self.metrics,
            'feature_importance': self.feature_importance,
            'targets': self.TARGETS
        }
        joblib.dump(model_data, path)
        print(f"Models saved to {path}")
    
    def load_models(self, path: str):
        """Load trained models"""
        data = joblib.load(path)
        self.models = data['models']
        self.metrics = data['metrics']
        self.feature_importance = data.get('feature_importance', {})
        print(f"Models loaded from {path}")
    
    def predict(self, X: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """Make predictions for all targets"""
        X_transformed = self.processor.transform(X)
        predictions = {}
        
        for target in self.TARGETS:
            if target in self.models:
                model = self.models[target]
                pred = model.predict(X_transformed)
                prob = model.predict_proba(X_transformed)[:, 1] if hasattr(model, 'predict_proba') else pred
                
                predictions[target] = {
                    'prediction': int(pred[0]),
                    'probability': float(prob[0])
                }
            else:
                predictions[target] = {
                    'prediction': 0,
                    'probability': 0.0,
                    'error': 'Model not trained'
                }
                
        return predictions
    
    def get_shap_values(self, X: pd.DataFrame, target: str) -> Optional[np.ndarray]:
        """Get SHAP values for explainability"""
        try:
            import shap
            if target not in self.models:
                return None
                
            model = self.models[target]
            X_transformed = self.processor.transform(X)
            
            # Use TreeExplainer for tree-based models
            if hasattr(model, 'feature_importances_'):
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X_transformed)
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]  # For binary classification
                return shap_values
            else:
                # Use KernelExplainer for other models (slower)
                explainer = shap.KernelExplainer(model.predict_proba, X_transformed[:100])
                shap_values = explainer.shap_values(X_transformed)
                return shap_values
        except Exception as e:
            print(f"SHAP calculation failed: {e}")
            return None


def train_pipeline(dataset_path: str, model_dir: str = "models") -> ModelTrainer:
    """Complete training pipeline"""
    print("=" * 60)
    print("GENEVA - Cardiovascular Risk Model Training Pipeline")
    print("=" * 60)
    
    # Load and process data
    processor, summary = load_and_process_dataset(dataset_path)
    print(f"\nDataset Summary:")
    print(f"  Samples: {summary['total_samples']}")
    print(f"  Features: {len(summary['categorical_features']) + len(summary['numerical_features'])}")
    print(f"  Targets: {list(summary['target_distribution'].keys())}")
    
    # Prepare features and targets
    X, y_dict = processor.prepare_features_and_targets()
    print(f"\nFeature matrix shape: {X.shape}")
    for target, y in y_dict.items():
        print(f"  {target}: {y.value_counts().to_dict()}")
    
    # Train models
    trainer = ModelTrainer(processor, model_dir)
    results = trainer.train_all_targets(X, y_dict)
    
    # Save models and preprocessor
    import os
    os.makedirs(model_dir, exist_ok=True)
    trainer.save_models(os.path.join(model_dir, "trained_model.joblib"))
    processor.save_preprocessor(os.path.join(model_dir, "preprocessor.joblib"))
    
    # Print summary
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE - Model Performance Summary")
    print("=" * 60)
    for target in trainer.TARGETS:
        if target in trainer.metrics:
            m = trainer.metrics[target]
            print(f"\n{target}:")
            print(f"  Model: {m.get('model_name', 'N/A')}")
            print(f"  Accuracy: {m['accuracy']:.4f}")
            print(f"  Precision: {m['precision']:.4f}")
            print(f"  Recall: {m['recall']:.4f}")
            print(f"  F1-Score: {m['f1_score']:.4f}")
            print(f"  ROC-AUC: {m.get('roc_auc', 'N/A')}")
            print(f"  Test Samples: {m['test_samples']}")
    
    print("\n" + "=" * 60)
    print("DISCLAIMER: These models are for research and educational use only.")
    print("Not clinically validated. Not a substitute for professional medical diagnosis.")
    print("=" * 60)
    
    return trainer