"""
ML Microservice — AI-Based Medical Diagnosis Assistant
Phase 2: Backend Architecture & ML Integration
 
Loads the trained Random Forest model + supporting artifacts and exposes
a small FastAPI service that the Node.js backend calls over HTTP.
 
Run with:
    uvicorn api:app --reload --port 8001
"""
 
import logging
from pathlib import Path
from typing import List
 
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------
 
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_engine")
 
ARTIFACT_DIR = Path(__file__).parent  # artifacts live alongside this script
MODEL_PATH = ARTIFACT_DIR / "best_disease_model.pkl"
COLUMNS_PATH = ARTIFACT_DIR / "symptom_columns.pkl"
ENCODER_PATH = ARTIFACT_DIR / "label_encoder.pkl"
 
TOP_K = 3  # number of differential-diagnosis candidates to return

# --------------------------------------------------------------------------
# Global artifact state
# --------------------------------------------------------------------------
# Loaded once at startup and reused across every request. This avoids the
# cost of reading the .pkl files from disk on every /predict call.
 
model = None
symptom_columns: List[str] = []
label_encoder = None
symptom_index_lookup = {}  # maps a normalized symptom name -> column index
 
 
def _normalize(symptom: str) -> str:
    """Normalize a raw symptom string so lookups are consistent
    regardless of stray whitespace or casing from upstream callers."""
    return symptom.strip().lower().replace(" ", "_")
 
 
def load_artifacts() -> None:
    """Load model, feature-column list, and label encoder into memory.
 
    Raises a RuntimeError with a clear message if any artifact is missing,
    so a misconfigured deployment fails loudly at startup rather than on
    the first request.
    """
    global model, symptom_columns, label_encoder, symptom_index_lookup
 
    for path in (MODEL_PATH, COLUMNS_PATH, ENCODER_PATH):
        if not path.exists():
            raise RuntimeError(
                f"Required artifact not found: {path}. "
                f"Make sure best_disease_model.pkl, symptom_columns.pkl, "
                f"and label_encoder.pkl are in {ARTIFACT_DIR}."
            )
 
    model = joblib.load(MODEL_PATH)
    symptom_columns = joblib.load(COLUMNS_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
 
    # symptom_columns entries look like "symptom_itching" (see training notebook).
    # Build a lookup keyed by the bare, normalized symptom name so the API
    # can accept plain symptom strings from the caller.
    symptom_index_lookup = {}
    for idx, col_name in enumerate(symptom_columns):
        bare_name = col_name[len("symptom_"):] if col_name.startswith("symptom_") else col_name
        symptom_index_lookup[_normalize(bare_name)] = idx
 
    logger.info(
        "Loaded model=%s, %d symptom columns, %d disease classes",
        type(model).__name__,
        len(symptom_columns),
        len(label_encoder.classes_),
    )


# --------------------------------------------------------------------------
# Pydantic schemas (input / output contract)
# --------------------------------------------------------------------------
 
class SymptomRequest(BaseModel):
    symptoms: List[str] = Field(
        ...,
        min_length=1,
        description="List of symptom strings, e.g. ['itching', 'skin_rash']",
    )
 
 
class DiseasePrediction(BaseModel):
    disease: str
    probability: float  # percentage, 0-100, rounded to 1 decimal
 
 
class PredictionResponse(BaseModel):
    predictions: List[DiseasePrediction]
    unrecognized_symptoms: List[str] = Field(
        default_factory=list,
        description="Symptoms in the request that did not match any known "
        "column. Returned for visibility/debugging on the caller's side; "
        "does not fail the request.",
    )
 
 
class HealthResponse(BaseModel):
    status: str
 
 

# --------------------------------------------------------------------------
# App setup
# --------------------------------------------------------------------------
 
app = FastAPI(
    title="Medical Diagnosis ML Engine",
    description="Internal microservice: symptom list -> top-3 differential diagnosis",
    version="1.0.0",
)
 
 
@app.on_event("startup")
def on_startup() -> None:
    load_artifacts()
 

 # --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
 
@app.get("/")
def root():
    return {
        "service": "Medical Diagnosis ML Engine",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "docs": "/docs",
        },
    }


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="API is running")
 
 
@app.post("/predict", response_model=PredictionResponse)
def predict(request: SymptomRequest) -> PredictionResponse:
    if model is None or label_encoder is None or not symptom_columns:
        # Defensive guard — should not happen if startup succeeded, but
        # avoids a confusing 500 stack trace if it ever does.
        raise HTTPException(status_code=503, detail="Model artifacts not loaded")
 
    # --- Build the binary feature vector ---
    vector = np.zeros(len(symptom_columns), dtype=np.int8)
    unrecognized = []
 
    for raw_symptom in request.symptoms:
        key = _normalize(raw_symptom)
        idx = symptom_index_lookup.get(key)
        if idx is not None:
            vector[idx] = 1
        else:
            unrecognized.append(raw_symptom)
 
    if vector.sum() == 0:
        raise HTTPException(
            status_code=422,
            detail=(
                "None of the provided symptoms matched the model's known "
                "symptom vocabulary. Cannot generate a prediction."
            ),
        )
 
    # --- Inference ---
    feature_row = vector.reshape(1, -1)
 
    if not hasattr(model, "predict_proba"):
        raise HTTPException(
            status_code=500,
            detail="Loaded model does not support probability estimates.",
        )
 
    probabilities = model.predict_proba(feature_row)[0]
 
    # --- Top-K differential diagnosis ---
    top_k_indices = np.argsort(probabilities)[::-1][:TOP_K]
    disease_names = label_encoder.inverse_transform(top_k_indices)
 
    predictions = [
        DiseasePrediction(
            disease=str(disease_names[i]),
            probability=round(float(probabilities[top_k_indices[i]]) * 100, 1),
        )
        for i in range(len(top_k_indices))
    ]
 
    return PredictionResponse(
        predictions=predictions,
        unrecognized_symptoms=unrecognized,
    )
 