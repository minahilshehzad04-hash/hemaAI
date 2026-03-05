# main.py - HemaAI Backend with Only Keras Model (Binary Symptoms)
import io
import os
import sys
import logging
import numpy as np
import json
import pickle
import pandas as pd
from datetime import datetime
from typing import Dict, Tuple, Optional, List, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from PIL import Image

import torch
from torchvision import transforms
from torchvision.models.googlenet import GoogLeNet

# ============ SETUP LOGGER ============
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('hemaai.log')
    ]
)
logger = logging.getLogger("hemaai")

# ============ CHECK FOR OPTIONAL LIBRARIES ============
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
    logger.info("TensorFlow available")
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logger.info("TensorFlow not available")

# ============ GLOBAL APP SETUP ============
app = FastAPI(
    title="HemaAI - Medical AI Assistant",
    description="AI-powered leukemia risk assessment and blood smear analysis",
    version="6.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRANSPARENT_1X1_PNG = b"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

@app.middleware("http")
async def suppress_favicon_logging(request: Request, call_next):
    if request.url.path == "/favicon.ico":
        return Response(content=TRANSPARENT_1X1_PNG, media_type="image/x-icon")
    return await call_next(request)

# ============ DATA MODELS ============
class LeukemiaSymptoms(BaseModel):
    """Pydantic model for leukemia symptoms input - Binary only (0 or 1)"""
    shortness_of_breath: int = Field(0, ge=0, le=1, description="Difficulty breathing (0=No, 1=Yes)")
    bone_pain: int = Field(0, ge=0, le=1, description="Bone or joint pain (0=No, 1=Yes)")
    fever: int = Field(0, ge=0, le=1, description="Recurrent fever (0=No, 1=Yes)")
    family_history: int = Field(0, ge=0, le=1, description="Family history of blood disorders (0=No, 1=Yes)")
    frequent_infections: int = Field(0, ge=0, le=1, description="Frequent infections (0=No, 1=Yes)")
    Itchy_skin_or_rash: int = Field(0, ge=0, le=1, description="Skin itching or rash (0=No, 1=Yes)")
    loss_of_appetite_or_nausea: int = Field(0, ge=0, le=1, description="Loss of appetite or nausea (0=No, 1=Yes)")
    Persistent_weakness_and_fatigue: int = Field(0, ge=0, le=1, description="Persistent weakness/fatigue (0=No, 1=Yes)")
    swollen_painless_lymph: int = Field(0, ge=0, le=1, description="Swollen lymph nodes (0=No, 1=Yes)")
    significant_bruising_bleeding: int = Field(0, ge=0, le=1, description="Easy bruising/bleeding (0=No, 1=Yes)")
    enlarged_liver: int = Field(0, ge=0, le=1, description="Enlarged liver (0=No, 1=Yes)")
    oral_cavity: int = Field(0, ge=0, le=1, description="Mouth sores/gum bleeding (0=No, 1=Yes)")
    vision_blurring: int = Field(0, ge=0, le=1, description="Blurred vision (0=No, 1=Yes)")
    jaundice: int = Field(0, ge=0, le=1, description="Yellow skin/eyes (0=No, 1=Yes)")
    night_sweats: int = Field(0, ge=0, le=1, description="Night sweats (0=No, 1=Yes)")
    smokes: int = Field(0, ge=0, le=1, description="Smoking history (0=No, 1=Yes)")

# ============ MODEL CONTAINERS ============
keras_model = None
image_model = None

# IMPORTANT: Must match EXACTLY with your CSV column names
feature_names = [
    'shortness_of_breath', 'bone_pain', 'fever', 'family_history',
    'frequent_infections', 'Itchy_skin_or_rash', 'loss_of_appetite_or_nausea',
    'Persistent_weakness_and_fatigue', 'swollen_painless_lymph',
    'significant_bruising_bleeding', 'enlarged_liver', 'oral_cavity',
    'vision_blurring', 'jaundice', 'night_sweats', 'smokes'
]

# ============ HELPER FUNCTIONS ============
def validate_binary_input(value: int) -> bool:
    """Validate that input is binary (0 or 1)"""
    return value in [0, 1]

def get_symptom_description(symptom_key: str) -> str:
    """Get description for each symptom"""
    descriptions = {
        'shortness_of_breath': 'Difficulty breathing during normal activities',
        'bone_pain': 'Pain in bones or joints',
        'fever': 'Recurrent or persistent fever',
        'family_history': 'Family history of blood disorders',
        'frequent_infections': 'Recurrent infections due to weak immunity',
        'Itchy_skin_or_rash': 'Unexplained skin itching or rashes',
        'loss_of_appetite_or_nausea': 'Reduced appetite or nausea',
        'Persistent_weakness_and_fatigue': 'Constant tiredness affecting daily activities',
        'swollen_painless_lymph': 'Swollen lymph nodes without pain',
        'significant_bruising_bleeding': 'Easy bruising or prolonged bleeding',
        'enlarged_liver': 'Enlarged liver detected by examination',
        'oral_cavity': 'Mouth sores or gum bleeding',
        'vision_blurring': 'Blurred vision or visual disturbances',
        'jaundice': 'Yellowing of skin or eyes',
        'night_sweats': 'Drenching night sweats',
        'smokes': 'Current or past smoking history'
    }
    return descriptions.get(symptom_key, "No description available")

def calculate_risk_score_from_proba(probabilities: List[float]) -> float:
    """Calculate risk score from model probabilities"""
    if len(probabilities) == 2:  # Binary classification
        risk_score = probabilities[1] * 100  # Convert to percentage
    elif len(probabilities) == 3:  # 3-class classification
        # Assuming indices: 0=Low, 1=Medium, 2=High
        risk_score = (probabilities[1] * 50) + (probabilities[2] * 100)
    else:
        risk_score = max(probabilities) * 100
    
    return round(min(risk_score, 100), 2)

def get_risk_level(risk_score: float) -> str:
    """Determine risk level based on score"""
    if risk_score >= 70:
        return "High"
    elif risk_score >= 40:
        return "Medium"
    else:
        return "Low"

def get_recommendations(risk_level: str, symptom_count: int) -> Tuple[List[str], List[str]]:
    """Generate recommendations based on risk level and symptoms"""
    
    if risk_level == "High" or symptom_count >= 8:
        next_steps = [
            "Immediate consultation with hematologist",
            "Complete blood count (CBC) test",
            "Peripheral blood smear examination",
            "Consider bone marrow biopsy"
        ]
        recommendations = [
            "Seek medical attention within 24 hours",
            "Avoid strenuous activities",
            "Monitor for fever or bleeding",
            "Complete diagnostic tests promptly"
        ]
    elif risk_level == "Medium":
        next_steps = [
            "Schedule doctor appointment",
            "Basic blood work (CBC, LDH)",
            "Consult hematology specialist",
            "Follow up in 2-4 weeks"
        ]
        recommendations = [
            "Monitor symptoms daily",
            "Maintain health journal",
            "Practice good hygiene",
            "Report worsening symptoms"
        ]
    else:
        next_steps = [
            "Annual health checkup",
            "Routine blood tests",
            "Maintain healthy lifestyle",
            "Reassess if new symptoms appear"
        ]
        recommendations = [
            "Regular exercise",
            "Balanced nutrition",
            "Adequate sleep",
            "Annual physical exam"
        ]
    
    return next_steps, recommendations

# ============ LOAD KERAS MODEL ONLY ============
def load_keras_model():
    """Load only Keras model"""
    global keras_model
    
    if not TENSORFLOW_AVAILABLE:
        logger.error("TensorFlow not available. Keras model cannot be loaded.")
        return
    
    model_path = "symptomsModel.keras"
    if not os.path.exists(model_path):
        logger.error(f"Keras model not found at {model_path}")
        return
    
    try:
        logger.info(f"Loading Keras model from {model_path}")
        keras_model = tf.keras.models.load_model(model_path)
        
        # Check model input shape
        if hasattr(keras_model, 'input_shape'):
            input_shape = keras_model.input_shape
            expected_features = input_shape[-1] if input_shape else None
            logger.info(f"Keras model expects {expected_features} features")
            
            if expected_features != len(feature_names):
                logger.warning(
                    f"Feature mismatch: Keras expects {expected_features}, we have {len(feature_names)} features"
                )
                logger.warning("Will add dummy features for compatibility")
        
        # Test the model
        expected_features = keras_model.input_shape[-1] if hasattr(keras_model, 'input_shape') else len(feature_names)
        dummy_input = np.zeros((1, expected_features), dtype=np.float32)
        
        # Warm up the model
        prediction = keras_model.predict(dummy_input, verbose=0)
        logger.info("Keras model loaded and tested successfully")
        
        # Log model info
        logger.info(f"Model output shape: {prediction.shape}")
        logger.info(f"Model summary: {keras_model.summary() if hasattr(keras_model, 'summary') else 'No summary available'}")
        
    except Exception as e:
        logger.error(f"Failed to load Keras model: {e}")
        keras_model = None

# ============ PREDICTION FUNCTIONS ============
def prepare_features_for_keras(symptoms: Dict) -> np.ndarray:
    """Prepare feature array for Keras (with padding if needed)"""
    features = []
    for feature in feature_names:
        # Get value, handle case variations
        value = symptoms.get(feature, 0)
        if value == 0:
            # Try lowercase version
            lower_feature = feature.lower()
            if lower_feature in symptoms:
                value = symptoms[lower_feature]
        
        # Ensure binary (0 or 1)
        binary_value = 1 if value != 0 else 0
        features.append(binary_value)
    
    # Add dummy features if Keras expects more than 16
    if keras_model is not None and hasattr(keras_model, 'input_shape'):
        expected_features = keras_model.input_shape[-1]
        if len(features) < expected_features:
            # Add dummy features (0 values) to match model expectation
            missing_features = expected_features - len(features)
            features.extend([0] * missing_features)
            logger.debug(f"Added {missing_features} dummy feature(s) for Keras compatibility")
        elif len(features) > expected_features:
            # Truncate if we have more features than expected
            logger.warning(f"Truncating features: expected {expected_features}, got {len(features)}")
            features = features[:expected_features]
    
    logger.debug(f"Keras features prepared: {features}")
    return np.array([features], dtype=np.float32)

def predict_with_keras(symptoms: Dict) -> Dict:
    """Make prediction using Keras model only"""
    try:
        if keras_model is None:
            logger.error("Keras model is not loaded")
            return None
        
        # Prepare features
        features = prepare_features_for_keras(symptoms)
        
        # Check if features match model input shape
        if hasattr(keras_model, 'input_shape'):
            expected_features = keras_model.input_shape[-1]
            if expected_features != features.shape[1]:
                logger.warning(
                    f"Feature shape mismatch: expected {expected_features}, got {features.shape[1]}"
                )
        
        # Get prediction
        predictions = keras_model.predict(features, verbose=0)
        prediction = np.argmax(predictions[0])
        probabilities = predictions[0].tolist()
        
        logger.info(f"Keras prediction: class={prediction}, probabilities={probabilities}")
        
        return {
            'prediction': int(prediction),
            'probabilities': probabilities,
            'model_type': 'keras',
            'model_name': 'Keras Neural Network'
        }
        
    except Exception as e:
        logger.error(f"Keras prediction error: {e}")
        return None

def predict_leukemia_risk(symptoms: LeukemiaSymptoms) -> Dict:
    """Main prediction function using only Keras model"""
    symptom_dict = symptoms.dict()
    
    # Count present symptoms
    symptom_count = sum(1 for v in symptom_dict.values() if v == 1)
    
    # Try Keras model first
    model_predictions = {}
    keras_result = predict_with_keras(symptom_dict)
    
    if keras_result:
        model_predictions['keras'] = keras_result
        model_predictions['primary'] = keras_result
        logger.info("Using Keras model for prediction")
    else:
        # If Keras fails, use rule-based fallback
        logger.warning("Keras model not available, using rule-based assessment")
        
        # Simple rule-based assessment
        if symptom_count >= 10:
            risk_score = 85
        elif symptom_count >= 6:
            risk_score = 60
        elif symptom_count >= 3:
            risk_score = 40
        else:
            risk_score = 20
        
        model_predictions['rule_based'] = {
            'prediction': 1 if risk_score >= 40 else 0,
            'probabilities': [1 - (risk_score/100), risk_score/100],
            'model_type': 'rule_based',
            'model_name': 'Rule-Based Assessment'
        }
        model_predictions['primary'] = model_predictions['rule_based']
    
    return model_predictions, symptom_count

# ============ IMAGE MODEL SETUP ============
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASS_MAP = {
    0: "Acute Leukemia",
    1: "Chronic Leukemia", 
    2: "Normal Blood Cells",
    3: "Lymphoma CLL",
    4: "Lymphoma FL",  
    5: "Lymphoma MCL",
    6: "Multiple Myeloma",
}

MODEL_PATH = "GoogleNet_jpg_full.pth"
IMAGE_SIZE = (128, 128)
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

_preprocess = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def load_image_model():
    """Load blood smear image classification model"""
    global image_model
    
    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Image model not found at {MODEL_PATH}")
        return
    
    try:
        logger.info("Loading blood smear image model...")
        
        # Load the model
        loaded = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        
        # Initialize GoogLeNet
        net = GoogLeNet(num_classes=7, aux_logits=False)
        
        # Load weights based on format
        if isinstance(loaded, dict) and "state_dict" in loaded:
            net.load_state_dict(loaded["state_dict"])
        elif isinstance(loaded, dict):
            net.load_state_dict(loaded)
        else:
            net = loaded
        
        image_model = net.to(device)
        image_model.eval()
        logger.info("Blood smear image model loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load image model: {e}")
        image_model = None

def preprocess_image(image: Image.Image) -> torch.Tensor:
    """Preprocess image for model input"""
    return _preprocess(image).unsqueeze(0).to(device)

# ============ FASTAPI ROUTES ============
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "api": "HemaAI Medical Assistant",
        "version": "6.0.0",
        "status": "operational",
        "endpoints": {
            "symptom_assessment": "/leukemia/assess-risk",
            "model_status": "/leukemia/model-status",
            "image_diagnosis": "/diagnose",
            "health_check": "/health",
            "docs": "/docs"
        },
        "models": {
            "keras": keras_model is not None,
            "image_model": image_model is not None
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "models": {
            "keras_loaded": keras_model is not None,
            "image_model_loaded": image_model is not None
        },
        "system": {
            "python_version": sys.version,
            "device": str(device)
        }
    }

@app.get("/leukemia/model-status")
async def get_model_status():
    """Get status of loaded ML models"""
    return {
        "status": "active" if keras_model else "inactive",
        "models": {
            "keras": {
                "loaded": keras_model is not None,
                "type": "Sequential" if keras_model else None,
                "features_expected": keras_model.input_shape[-1] if keras_model and hasattr(keras_model, 'input_shape') else None,
                "features_provided": len(feature_names)
            },
            "image_model": {
                "loaded": image_model is not None,
                "type": "GoogLeNet" if image_model else None
            }
        },
        "symptoms": {
            "total_symptoms": len(feature_names),
            "symptom_type": "binary",
            "feature_names": feature_names
        },
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.get("/leukemia/symptoms-info")
async def get_symptoms_info():
    """Get information about symptoms"""
    symptoms_info = {}
    for feature in feature_names:
        symptoms_info[feature] = {
            "description": get_symptom_description(feature),
            "allowed_values": [0, 1],
            "meaning": {
                "0": "Not Present",
                "1": "Present"
            }
        }
    
    return {
        "symptoms": symptoms_info,
        "total_symptoms": len(feature_names),
        "note": "All symptoms are binary (0=Not Present, 1=Present)",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@app.post("/leukemia/assess-risk")
async def assess_leukemia_risk(symptoms: LeukemiaSymptoms):
    """
    Assess leukemia risk based on symptoms
    
    All symptoms must be 0 (not present) or 1 (present)
    """
    try:
        logger.info("Processing leukemia risk assessment request")
        
        # Validate all inputs are binary
        symptom_dict = symptoms.dict()
        for key, value in symptom_dict.items():
            if not validate_binary_input(value):
                raise HTTPException(
                    status_code=400,
                    detail=f"Symptom '{key}' must be 0 or 1. Got: {value}"
                )
        
        # Get predictions
        predictions, symptom_count = predict_leukemia_risk(symptoms)
        
        if 'primary' not in predictions:
            raise HTTPException(status_code=500, detail="No prediction models available")
        
        primary_pred = predictions['primary']
        
        # Calculate risk score from probabilities
        risk_score = calculate_risk_score_from_proba(primary_pred['probabilities'])
        risk_level = get_risk_level(risk_score)
        
        # Get recommendations
        next_steps, recommendations = get_recommendations(risk_level, symptom_count)
        
        # Prepare symptom details
        symptom_details = []
        present_symptoms = []
        
        for key, value in symptom_dict.items():
            if value == 1:
                present_symptoms.append(key.replace('_', ' ').title())
                symptom_details.append({
                    'symptom': key.replace('_', ' ').title(),
                    'present': True,
                    'description': get_symptom_description(key)
                })
        
        # Build response
        response = {
            "status": "success",
            "risk_assessment": {
                "risk_score": risk_score,
                "risk_level": risk_level,
                "symptom_count": symptom_count,
                "present_symptoms": present_symptoms
            },
            "model_info": {
                "model_used": primary_pred['model_name'],
                "model_type": primary_pred['model_type'],
                "probabilities": primary_pred['probabilities']
            },
            "clinical_guidance": {
                "next_steps": next_steps,
                "recommendations": recommendations,
                "interpretation": f"Based on {symptom_count} symptoms, the AI model indicates {risk_level.lower()} risk ({risk_score}%) of leukemia."
            },
            "symptom_details": symptom_details,
            "debug_info": {
                "models_available": list(predictions.keys()),
                "features_used": len(feature_names),
                "input_validated": True
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        logger.info(f"Assessment completed: {risk_level} risk ({risk_score}%)")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Assessment failed: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@app.post("/diagnose")
async def diagnose_blood_smear(file: UploadFile = File(...)):
    """Diagnose blood smear image"""
    if image_model is None:
        raise HTTPException(status_code=503, detail="Image model not loaded")
    
    # Validate file
    if file.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images supported")
    
    try:
        # Read and validate file size
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 20MB)")
        
        # Open and preprocess image
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        input_tensor = preprocess_image(image)
        
        # Make prediction
        with torch.no_grad():
            output = image_model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            predicted_class = torch.argmax(probabilities).item()
            confidence = probabilities[predicted_class].item()
        
        diagnosis = CLASS_MAP.get(predicted_class, "Unknown")
        
        # Get all probabilities
        all_probs = {}
        for i, class_name in CLASS_MAP.items():
            all_probs[class_name] = round(probabilities[i].item() * 100, 2)
        
        # Generate recommendations
        recommendations = [
            f"Diagnosis: {diagnosis} (confidence: {confidence*100:.1f}%)",
            "Consult with a hematologist for confirmation",
            "Consider additional tests if symptoms are present",
            "Follow up with appropriate specialist based on diagnosis"
        ]
        
        return {
            "status": "success",
            "diagnosis": {
                "condition": diagnosis,
                "confidence": round(confidence * 100, 2),
                "class_id": predicted_class
            },
            "probabilities": all_probs,
            "recommendations": recommendations,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
    except Exception as e:
        logger.exception(f"Image diagnosis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

# ============ STARTUP EVENT ============
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("=" * 60)
    logger.info("Starting HemaAI Medical Assistant")
    logger.info("=" * 60)
    
    # Load ML models
    logger.info("Loading machine learning models...")
    
    # Load only Keras model for symptoms
    load_keras_model()
    
    # Load image model separately
    load_image_model()
    
    logger.info("=" * 60)
    logger.info("HemaAI Startup Complete")
    logger.info("=" * 60)
    logger.info("Symptom Models:")
    logger.info(f"   • Keras Model: {'Loaded' if keras_model else 'Not found'}")
    logger.info(f"   • Image Model: {'Loaded' if image_model else 'Not found'}")
    logger.info("System Info:")
    logger.info(f"   • Device: {device}")
    logger.info(f"   • Features: {len(feature_names)} binary symptoms")
    
    if keras_model and hasattr(keras_model, 'input_shape'):
        logger.info(f"   • Keras expects: {keras_model.input_shape[-1]} features")
    
    logger.info("Server Ready:")
    logger.info(f"   • API: http://localhost:8000")
    logger.info(f"   • Docs: http://localhost:8000/docs")
    logger.info("=" * 60)

# ============ MAIN ENTRY POINT ============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True, log_level="info")