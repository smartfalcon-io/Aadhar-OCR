from fastapi import FastAPI
from app.api import aadhaar_api

app = FastAPI(title="Aadhaar OCR API")

app.include_router(aadhaar_api.router)
