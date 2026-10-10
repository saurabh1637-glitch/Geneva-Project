# GENEVA — AI Cardiovascular Risk Visualization & Prediction System

A research prototype for the **IIT Mandi Multimodal AI Hackathon 2026, Track A: Cardiovascular Risk Visualization & Prediction**.

## Overview

GENEVA predicts overall coronary artery disease (CAD) status and vessel-specific stenosis for LAD, LCX, and RCA using the Z-Alizadeh Sani dataset. Features include explainable AI, interactive 3D heart visualization, and comprehensive model transparency.

⚠️ **IMPORTANT DISCLAIMER**: This system is for research and educational use only. It has **not been clinically validated**, FDA-approved, or reviewed by medical professionals. Predictions should **never** be used as a substitute for professional medical diagnosis or treatment.

## Features

- **Multi-Target Prediction**: Overall CAD + vessel-specific (LAD, LCX, RCA) stenosis prediction
- **Interactive 3D Heart**: Real-time anatomical visualization with coronary artery risk overlay
- **Explainable AI**: SHAP-based feature importance and instance-level explanations
- **Model Transparency**: ROC curves, confusion matrices, per-target metrics
- **PDF Reports**: Professional clinical-style reports with safety disclaimers
- **Dataset Explorer**: Full data documentation with preprocessing details

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Three.js/R3F |
| Backend | FastAPI, Python 3.11+, Pydantic, SQLAlchemy, SQLite |
| ML | scikit-learn, pandas, NumPy, SHAP, joblib, ReportLab |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### 1. Clone and Setup

```bash
cd /Users/pateldevasya/Desktop/Hecekton
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Dataset

Place the Z-Alizadeh Sani dataset at:
```
data/Z-Alizadeh_Sani_dataset.xlsx
```

See `data/README.md` for expected format.

### 4. Train Models

```bash
# From project root
python train.py
```

This trains models and saves them to `models/`.

### 5. Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 6. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:5173

## Project Structure

```
Hecekton/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routes
│   │   ├── core/         # Config, database
│   │   ├── ml/           # ML pipeline (data_processor, trainer)
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Report generation
│   │   └── main.py       # FastAPI app
│   ├── tests/            # API tests
│   ├── requirements.txt
│   └── train.py          # Training script
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helpers, form config
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── data/                 # Dataset (gitignored)
├── models/               # Trained models (gitignored)
└── train.py              # Root training script
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health check |
| `/api/dataset/summary` | GET | Dataset statistics |
| `/api/patients` | GET/POST | List/create patients |
| `/api/patients/{id}` | GET | Get patient |
| `/api/predict` | POST | Predict risk for input |
| `/api/analyses` | GET/POST | List/create analyses |
| `/api/analyses/{id}` | GET | Get analysis |
| `/api/models/metrics` | GET | Model performance |
| `/api/explainability/{target}` | GET | SHAP/feature importance |
| `/api/reports/{id}/pdf` | POST/GET | Generate/download PDF |

## Pages

1. **Landing** (`/`) - Project overview, features, disclaimer
2. **Dashboard** (`/dashboard`) - Stats, recent analyses, quick actions
3. **New Analysis** (`/patients/new`) - Patient input form with validation
4. **Patient Records** (`/patients`) - Searchable patient list
5. **Patient Detail** (`/patients/:id`) - Patient history
6. **Results** (`/results/:id`) - Predictions, 3D heart, feature contributions
7. **3D Heart** (`/heart-3d`) - Interactive anatomical visualization
8. **Explainability** (`/explainability`) - Feature importance per target
9. **Model Performance** (`/model-performance`) - Metrics, ROC curves, confusion matrices
10. **Reports** (`/reports`) - PDF report generation
11. **Dataset** (`/dataset`) - Data documentation
12. **About** (`/about`) - Project info, methodology
13. **Settings** (`/settings`) - Preferences, system status

## Development

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

### Type Checking

```bash
cd frontend
npx tsc --noEmit
```

## Model Training Details

The training pipeline (`train.py`):

1. **Loads dataset** from `data/Z-Alizadeh_Sani_dataset.xlsx`
2. **Explores data** - identifies features, targets, missing values
3. **Preprocesses** - median imputation + scaling (numerical), mode + label encoding (categorical)
4. **Prevents leakage** - excludes CAD, LAD, LCX, RCA, Cath from features
5. **Trains** - Random Forest, Gradient Boosting, Logistic Regression per target
6. **Selects** - Best F1-score with 5-fold stratified CV
7. **Evaluates** - Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix
8. **Saves** - Models and preprocessor to `models/`

## Dataset

**Z-Alizadeh Sani Coronary Artery Disease Dataset**

- Source: UCI Machine Learning Repository
- DOI: 10.24432/C5V30N
- Samples: 303 patients
- Features: 39 clinical, laboratory, echocardiographic variables
- Targets: CAD, LAD, LCX, RCA, Cath (binary stenosis ≥50%)

## License

This project is developed for the IIT Mandi Multimodal AI Hackathon 2026.

## Acknowledgments

- Z-Alizadeh Sani dataset creators
- IIT Mandi hackathon organizers
- Open-source community for all libraries used