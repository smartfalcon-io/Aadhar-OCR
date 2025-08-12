# Aadhaar OCR API (Python + FastAPI)

A simple OCR (Optical Character Recognition) API built with FastAPI that extracts **Name, DOB, Gender, and Address** from Aadhaar card images.

---

## 🚀 Features
- Upload Aadhaar **front** and **back** images
- Extracts:
  - Full Name
  - Date of Birth
  - Gender
  - Address
- Built with **FastAPI** + **Pytesseract**
- Returns clean **JSON response**

---

## ▶️ Run the Server

```bash
uvicorn app.main:app --reload

```bash
docker build -t my-fastapi-ocr-app .

```bash
docker run -d -p 8000:8000 --name fastapi-ocr-container my-fastapi-ocr-app

```bash
docker logs -f fastapi-ocr-container