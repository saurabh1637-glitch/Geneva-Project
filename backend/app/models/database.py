from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(50), unique=True, index=True, nullable=False)
    age = Column(Float)
    gender = Column(String(10))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    analyses = relationship("Analysis", back_populates="patient")


class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    input_data = Column(JSON, nullable=False)
    cad_prediction = Column(Float)
    lad_prediction = Column(Float)
    lcx_prediction = Column(Float)
    rca_prediction = Column(Float)
    cad_probability = Column(Float)
    lad_probability = Column(Float)
    lcx_probability = Column(Float)
    rca_probability = Column(Float)
    feature_contributions = Column(JSON)
    model_version = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="analyses")
    report = relationship("Report", back_populates="analysis", uselist=False)


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), unique=True, nullable=False)
    pdf_path = Column(String(500))
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    analysis = relationship("Analysis", back_populates="report")