# Legal Metrology Label Compliance Checker 🚀

> An AI-powered solution built for the 48-Hour Hackathon to validate packaged goods against Legal Metrology Rules.

## 🎯 Overview

This application allows users to upload images of packaged goods. The system extracts text using OCR, calculates physical font sizes and prominence using computer vision, and utilizes an LLM to validate if the label complies with rules such as the presence of MRP, expiry date, manufacturer info, and net quantity.

## 🛠 Tech Stack

- **Frontend:** React (TypeScript) + Vite + Tailwind CSS + Lucide React
- **Backend:** Python + FastAPI + Pydantic
- **AI/ML Pipeline:** Google Cloud Vision API (OCR), OpenCV (Bounding Box Math), Gemini 2.0 Flash (Reasoning)
- **Database/Storage:** Firebase Admin (Firestore & Storage)

## 🏗 Architecture

1. **Upload:** User uploads an image via the drag-and-drop React UI.
2. **Storage:** The FastAPI backend securely uploads the image to Firebase Cloud Storage.
3. **OCR:** Google Cloud Vision API extracts the raw text and spatial bounding polygons.
4. **Computer Vision:** OpenCV calculates Euclidean dimensions of the text to estimate font prominence.
5. **Reasoning:** Gemini 2.0 Flash takes the multi-modal data and structured schema to generate a `LabelComplianceReport`.
6. **Logging:** The final JSON report is stored in Firestore and returned to the aesthetic "Bento Grid" dashboard.

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- Python (3.11+)
- A Google Cloud Service Account with Vision API and Firebase enabled.
- A Gemini API Key.

### Backend Setup
1. Open `backend/.env` and add your `GEMINI_API_KEY`.
2. Open `backend/credentials.json` and paste your Firebase Service Account JSON.
3. Run the following:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Deployment (Cloud Run)

The backend is fully containerized and ready for Google Cloud Run:
```bash
cd backend
docker build -t label-checker-api .
docker run -p 8000:8000 --env-file .env label-checker-api
```
*(Make sure to volume mount or securely inject `credentials.json` in production!)*
