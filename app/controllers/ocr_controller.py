from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
import pytesseract
from PIL import Image
import io
from app.utils.ocr_utils import extract_aadhaar_info

class OcrController:
    async def parse_aadhar(self, frontImage: UploadFile = File(...), backImage: UploadFile = File(...)):
        try:
            front_bytes = await frontImage.read()
            back_bytes = await backImage.read()

            front_text = pytesseract.image_to_string(Image.open(io.BytesIO(front_bytes)))
            back_text = pytesseract.image_to_string(Image.open(io.BytesIO(back_bytes)))

            info = extract_aadhaar_info(front_text, back_text)

            return JSONResponse(content={"status": True, "data": info})

        except Exception as e:
            return JSONResponse(content={"status": False, "error": str(e)})
