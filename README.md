# Legal Metrology Label Compliance Checker 🚀

> An AI-powered solution built for the SIH Hackathon to validate packaged goods against Legal Metrology Rules.

## 🎯 Overview

This application allows users to upload images of packaged goods. The system extracts text using OCR, calculates physical font sizes and prominence using computer vision, and utilizes an LLM to validate if the label complies with rules such as the presence of MRP, expiry date, manufacturer info, and net quantity.

## 🛠 Tech Stack

- **Frontend:** React (TypeScript) + Vite + Tailwind CSS + Lucide React + HTML5-QRCode
- **Backend:** Python + FastAPI + Pydantic + Requests
- **AI/ML Pipeline:** Google Cloud Vision API (OCR), OpenCV (Bounding Box Math), Gemini 3.6 Flash (Reasoning)
- **Database/Storage:** Firebase Admin (Firestore & Storage)
- **External APIs:** Open Food Facts API (Live GS1 Barcode Lookup)

## 🏗 Architecture

1. **Upload / Scan:** User scans a product barcode via device camera and uploads an image via the React UI.
2. **Storage:** The FastAPI backend securely uploads the image to Firebase Cloud Storage.
3. **Live GS1 Lookup:** The backend queries the **Open Food Facts API** using the scanned GTIN to retrieve real-world product and brand details.
4. **OCR:** Google Cloud Vision API extracts the raw text and spatial bounding polygons from the image.
5. **Computer Vision:** OpenCV calculates Euclidean dimensions of the text to estimate font prominence.
6. **Reasoning:** Gemini 2.0 Flash takes the multi-modal data, live GS1 data, and structured schema to generate a `LabelComplianceReport`.
7. **Logging:** The final JSON report is stored in Firestore and returned to the aesthetic "Bento Grid" dashboard.

## ✨ New Features
* **Live Hardware Barcode Scanning:** Integrated `html5-qrcode` to enable real-time camera scanning of product barcodes (EAN, UPC) directly in the web app.
* **Open Food Facts API Integration:** Replaced static mock data with live HTTP queries to a public barcode database to retrieve actual product descriptions and brand names.
* **Anti-Forgery MRP Generation:** Dynamically generates a stable simulated MRP for live barcodes so the AI's price-forgery detection logic remains functional during hackathon demos.

## 📡 API Endpoints

### `POST /api/v1/analyze-label`
Analyzes a package label image for legal metrology compliance.

**Request:**
* `file` (multipart/form-data): The image file of the product label.
* `barcode` (multipart/form-data, optional): A scanned GTIN/barcode string to prioritize for GS1 database lookup.

**Response:**
Returns a JSON object matching the `LabelComplianceReport` schema containing:
* Overall verdict (Compliant / Non-Compliant)
* Extracted text, MRP, Expiry Date, and Manufacturer details
* Live GS1 Registry Verification Data (via Open Food Facts)
* Font size & prominence advisories

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
