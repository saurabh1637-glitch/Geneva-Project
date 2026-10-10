import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
import warnings
warnings.filterwarnings('ignore')


class ZAlizadehSaniProcessor:
    """Processor for the Z-Alizadeh Sani dataset"""
    
    # Target columns as specified in the hackathon requirements
    TARGET_COLUMNS = ['CAD', 'LAD', 'LCX', 'RCA']
    
    # Columns to exclude from features (target leakage prevention)
    LEAKAGE_COLUMNS = ['CAD', 'LAD', 'LCX', 'RCA', 'Cath']
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.df: Optional[pd.DataFrame] = None
        self.feature_columns: List[str] = []
        self.categorical_columns: List[str] = []
        self.numerical_columns: List[str] = []
        self.preprocessor: Optional[ColumnTransformer] = None
        self.target_encoders: Dict[str, LabelEncoder] = {}
        
    def load_data(self) -> pd.DataFrame:
        """Load the dataset from Excel file"""
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset not found at {self.dataset_path}")
        
        self.df = pd.read_excel(self.dataset_path)
        print(f"Loaded dataset with shape: {self.df.shape}")
        print(f"Columns: {list(self.df.columns)}")
        return self.df
    
    def explore_data(self) -> Dict[str, Any]:
        """Explore and return dataset statistics"""
        if self.df is None:
            self.load_data()
            
        summary = {
            'total_samples': len(self.df),
            'columns': list(self.df.columns),
            'dtypes': {col: str(dtype) for col, dtype in self.df.dtypes.items()},
            'missing_values': self.df.isnull().sum().to_dict(),
            'target_distribution': {},
            'categorical_features': [],
            'numerical_features': []
        }
        
        # Identify target distributions
        for target in self.TARGET_COLUMNS:
            if target in self.df.columns:
                summary['target_distribution'][target] = self.df[target].value_counts().to_dict()
        
        # Identify feature types (excluding leakage columns)
        feature_cols = [c for c in self.df.columns if c not in self.LEAKAGE_COLUMNS]
        for col in feature_cols:
            if self.df[col].dtype in ['object', 'category']:
                summary['categorical_features'].append(col)
            else:
                summary['numerical_features'].append(col)
                
        self.categorical_columns = summary['categorical_features']
        self.numerical_columns = summary['numerical_features']
        self.feature_columns = feature_cols
        
        return summary
    
    def prepare_features_and_targets(self) -> Tuple[pd.DataFrame, Dict[str, pd.Series]]:
        """Prepare feature matrix and target vectors"""
        if self.df is None:
            self.load_data()
            
        # Features: all columns except leakage columns
        X = self.df[self.feature_columns].copy()
        
        # Targets: CAD, LAD, LCX, RCA
        y_dict = {}
        for target in self.TARGET_COLUMNS:
            if target in self.df.columns:
                y_dict[target] = self.df[target].copy()
            else:
                print(f"Warning: Target column {target} not found in dataset")
                
        return X, y_dict
    
    def create_preprocessor(self) -> ColumnTransformer:
        """Create preprocessing pipeline"""
        if not self.categorical_columns and not self.numerical_columns:
            self.explore_data()
            
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', LabelEncoder())  # Will be handled separately for each column
        ])
        
        numerical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        
        # We'll handle categorical encoding manually to preserve column names
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, self.numerical_columns),
            ],
            remainder='passthrough'
        )
        
        return self.preprocessor
    
    def fit_preprocessor(self, X: pd.DataFrame) -> ColumnTransformer:
        """Fit the preprocessor on training data"""
        if self.preprocessor is None:
            self.create_preprocessor()
            
        # Handle categorical columns separately
        X_processed = X.copy()
        for col in self.categorical_columns:
            if col in X_processed.columns:
                le = LabelEncoder()
                # Handle missing values
                X_processed[col] = X_processed[col].fillna('missing')
                X_processed[col] = le.fit_transform(X_processed[col].astype(str))
                self.target_encoders[col] = le
        
        # Fit numerical preprocessor
        if self.numerical_columns:
            num_data = X_processed[self.numerical_columns]
            self.preprocessor.fit(num_data)
        
        return self.preprocessor
    
    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Transform features using fitted preprocessor"""
        if self.preprocessor is None:
            raise ValueError("Preprocessor not fitted. Call fit_preprocessor first.")
            
        X_processed = X.copy()
        for col in self.categorical_columns:
            if col in X_processed.columns:
                le = self.target_encoders.get(col)
                if le:
                    X_processed[col] = X_processed[col].fillna('missing')
                    # Handle unseen categories
                    X_processed[col] = X_processed[col].apply(
                        lambda x: le.transform([x])[0] if x in le.classes_ else -1
                    )
        
        if self.numerical_columns:
            num_transformed = self.preprocessor.transform(X_processed[self.numerical_columns])
            # Combine with categorical columns
            cat_data = X_processed[self.categorical_columns].values if self.categorical_columns else np.array([]).reshape(len(X_processed), 0)
            return np.hstack([num_transformed, cat_data])
        else:
            return X_processed[self.categorical_columns].values
    
    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        """Fit and transform features"""
        self.fit_preprocessor(X)
        return self.transform(X)
    
    def save_preprocessor(self, path: str):
        """Save preprocessor and encoders"""
        joblib.dump({
            'preprocessor': self.preprocessor,
            'categorical_encoders': self.target_encoders,
            'categorical_columns': self.categorical_columns,
            'numerical_columns': self.numerical_columns,
            'feature_columns': self.feature_columns
        }, path)
    
    def load_preprocessor(self, path: str):
        """Load preprocessor and encoders"""
        data = joblib.load(path)
        self.preprocessor = data['preprocessor']
        self.target_encoders = data['categorical_encoders']
        self.categorical_columns = data['categorical_columns']
        self.numerical_columns = data['numerical_columns']
        self.feature_columns = data['feature_columns']
    
    def get_feature_names(self) -> List[str]:
        """Get feature names after preprocessing"""
        if self.preprocessor is None:
            return self.feature_columns
            
        # Get numerical feature names (they stay the same)
        num_features = self.numerical_columns
        cat_features = self.categorical_columns
        return num_features + cat_features
    
    def split_data(self, X: pd.DataFrame, y: pd.Series, test_size: float = 0.2, 
                   random_state: int = 42, stratify: bool = True) -> Tuple:
        """Split data with stratification if possible"""
        if stratify and y.nunique() > 1:
            # Check if each class has enough samples
            class_counts = y.value_counts()
            if (class_counts >= 2).all():
                return train_test_split(
                    X, y, test_size=test_size, random_state=random_state, stratify=y
                )
        
        return train_test_split(X, y, test_size=test_size, random_state=random_state)


def load_and_process_dataset(dataset_path: str) -> Tuple[ZAlizadehSaniProcessor, Dict]:
    """Convenience function to load and process dataset"""
    processor = ZAlizadehSaniProcessor(dataset_path)
    processor.load_data()
    summary = processor.explore_data()
    return processor, summary