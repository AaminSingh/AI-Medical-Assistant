# 🩺 Aegis AI — Next-Generation AI Medical Assistant & Triage Platform

Aegis AI is an advanced, multi-tier AI-powered medical diagnosis and patient triage web platform. It combines clinical Machine Learning (Random Forest classification), Large Language Models (Groq LLaMA 3.3 70B), and full-stack web engineering to provide instant, interactive symptom triage, differential diagnosis predictions, specialist recommendations, personalized diet plans, and exportable PDF medical summaries.

---

## 🚀 Key Features

- **💬 Conversational AI Triage**: Interactive multi-turn chat interview powered by Groq LLaMA 3.3. Asks up to 3 smart follow-up questions to gather complete symptom context before running diagnosis.
- **🩺 Machine Learning Differential Diagnosis**: Predicts top-3 candidate conditions with exact probability scores based on a trained Random Forest classification model.
- **🚨 Red-Flag Emergency Detection**: Real-time keyword triage filter that instantly flags life-threatening symptoms (e.g., chest pain, difficulty breathing, stroke signs) and directs users to emergency care.
- **👨‍⚕️ Dynamic Specialist & Care Guidelines**: Automatically recommends the appropriate medical specialist (e.g., Gastroenterologist, Neurologist, Dermatologist) along with 3 tailored home care precautions.
- **🍏 AI Diet & Macronutrient Planner**: Generates personalized daily caloric targets, macronutrient splits (Proteins, Carbs, Fats), 1-day meal plans, and clinical nutrition advice based on patient demographics.
- **📊 Analytics & Model Benchmarking Dashboard**: Visual charts powered by Recharts comparing ML model accuracy (Random Forest vs XGBoost vs Decision Tree) and disease cohort distributions.
- **📜 Session History & Audit Trail**: Persists past consultations to MongoDB with instant timeline filtering and historical record review.
- **📄 Printable PDF Medical Reports**: Generates formal clinical report summaries exportable directly to PDF for doctor consultations.
- **⚖️ BMI Index Calculator**: Interactive Body Mass Index tool with instant health category feedback.
- **🔐 Secure Authentication**: JWT token-based authentication stored in HTTP-Only cookies with bcryptjs password encryption.

---

## 🏗️ System Architecture

Aegis AI is built on a decoupled, 3-tier microservices architecture:

```
┌─────────────────────────┐      HTTP / JSON      ┌──────────────────────────────┐
│   React 18 + Vite UI    │ <───────────────────> │  Node.js + Express Backend   │
│   TailwindCSS + Recharts│                       │   MongoDB + Mongoose ORM     │
└─────────────────────────┘                       └──────────────┬───────────────┘
                                                                 │
                                          ┌──────────────────────┴──────────────────────┐
                                          │                                             │
                                   HTTP / JSON                                    Groq SDK API
                                          │                                             │
                                          ▼                                             ▼
                          ┌──────────────────────────────┐              ┌──────────────────────────────┐
                          │ Python FastAPI ML Engine     │              │  Groq LLaMA 3.3 70B Model    │
                          │ Scikit-Learn Random Forest   │              │  NLP Extraction & Triage     │
                          └──────────────────────────────┘              └──────────────────────────────┘
```

1. **Frontend (`ai-medical-frontend`)**: React 18, Vite, Tailwind CSS v4, Lucide React Icons, Recharts.
2. **Backend API (`AI_medical_backend MDB`)**: Node.js, Express.js (v5), MongoDB, Mongoose, JWT Authentication, Cookie-Parser.
3. **ML Microservice (`ml_engine`)**: Python 3, FastAPI, Uvicorn, Scikit-Learn, Joblib, NumPy, Pandas.

---

## 🤖 Models & AI Architecture

### 1. Machine Learning Disease Classifier
- **Model**: Scikit-Learn `RandomForestClassifier` (`best_disease_model.pkl`).
- **Feature Space**: 131 standard medical symptom binary vectors (`symptom_columns.pkl`).
- **Target Classes**: 41 distinct medical disease categories encoded via `LabelEncoder` (`label_encoder.pkl`).
- **Inference Engine**: Exposed via a FastAPI microservice on `http://localhost:8001/predict`. Converts natural language extracted keywords into binary vectors `[0, 1]` for multi-class probability inference.

### 2. Conversational LLM Engine
- **Model**: Groq LLaMA 3.3 70B Versatile (`llama-3.3-70b-versatile`).
- **Role**: Natural language symptom extraction, multi-turn follow-up triage questioning, specialist care insight synthesis, dynamic diet plan generation, and intelligent fail-safe diagnosis fallback.

---

## 🔑 API Keys & Environment Setup

The backend configuration relies on an `.env` file located in `AI_medical_backend MDB/.env`:

### Environment File Template (`.env`)

```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai_medical
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_jwt_secret_key_here
ACCESS_TOKEN_EXPIRY=1d
GROQ_API_KEY=gsk_your_groq_api_key_here
PYTHON_ML_URL=http://localhost:8001/predict
```

### Obtaining API Keys
- **Groq API Key**: Sign up at [console.groq.com](https://console.groq.com/) and generate a new API Key.
- **MongoDB URI**: Create a free MongoDB Atlas cluster or use a local MongoDB instance (`mongodb://localhost:27017/ai_medical`).

---

## 🎯 Model Fine-Tuning & Optimization Strategy

To achieve high clinical precision and prevent hallucinations, several fine-tuning and optimization techniques were implemented:

1. **Symptom Vector Normalization & Fuzzy Mapping**:
   - Raw free-text inputs from patients are processed by Groq LLaMA to map messy descriptions (e.g., "my tummy hurts and I'm throwing up") into standard clinical terms (`abdominal_pain`, `vomiting`).
   - The ML service normalizes these terms by stripping prefixes, removing whitespace, and performing indexed lookups against the 131 dataset columns.

2. **Hyperparameter Selection for High Top-K Recall**:
   - The `RandomForestClassifier` was trained using balanced class weights (`class_weight='balanced'`) and tuned decision tree depth to ensure optimal sensitivity across rare and common diseases alike.
   - Evaluates `predict_proba` matrix to return top-3 candidate conditions rather than a single rigid answer, mimicking actual medical differential diagnosis workflows.

3. **Strict JSON Schema Enforcement**:
   - LLM prompts enforce deterministic JSON schemas with temperature settings set to low values (`0.2` - `0.3`). This guarantees zero markdown leakage and valid data parsing across microservice boundaries.

4. **Fail-Safe Dynamic LLM Fallback**:
   - If the Python ML microservice is offline or encounters non-matching symptoms, the backend automatically triggers an LLM fallback diagnosis mode (`getLLMFallbackDiagnosis`) to preserve system uptime and provide user guidance.

---

## ⚙️ Running Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB instance or MongoDB Atlas Connection

### 1. Start the Python ML Engine
```bash
cd "AI_medical_backend MDB"
python -m uvicorn ml_engine.api:app --reload --port 8001
```
*The ML engine will run at `http://localhost:8001`.*

### 2. Start the Node.js Express Backend
```bash
cd "AI_medical_backend MDB"
npm install
npm run dev
```
*The backend API will run at `http://localhost:8000`.*

### 3. Start the React Frontend
```bash
cd "ai-medical-frontend"
npm install
npm run dev
```
*The web frontend will run at `http://localhost:5173`.*

---

## ⚠️ Medical Disclaimer

*Aegis AI is built for educational and demonstration purposes only as part of an AI capstone project. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any medical concerns.*
