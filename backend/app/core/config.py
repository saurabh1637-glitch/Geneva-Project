from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    APP_NAME: str = "GENEVA - AI Cardiovascular Risk Visualization & Prediction System"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # Dataset
    DATASET_PATH: str = os.path.join(os.path.dirname(__file__), "../../../data/Z-Alizadeh_Sani_dataset.xlsx")
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "../../../data")
    
    # Model
    MODEL_DIR: str = os.path.join(os.path.dirname(__file__), "../../../models")
    MODEL_PATH: str = os.path.join(os.path.dirname(__file__), "../../../models/trained_model.joblib")
    PREPROCESSOR_PATH: str = os.path.join(os.path.dirname(__file__), "../../../models/preprocessor.joblib")
    
    # Database
    DATABASE_URL: str = "sqlite:///./geneva.db"
    
    # API
    API_PREFIX: str = "/api"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()