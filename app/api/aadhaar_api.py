from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
import pytesseract, io
from app.utils.ocr_utils import extract_aadhaar_info

router = APIRouter()

@router.post("/parse-aadhar")
async def parse_aadhar(
    frontImage: UploadFile = File(...),
    backImage: UploadFile = File(...),
    name: str = Form(None)  
):
    try:
        if not frontImage.content_type.startswith("image/") or not backImage.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Both files must be images (jpg/png)")

        front_bytes = await frontImage.read()
        back_bytes = await backImage.read()

        try:
            front_text = pytesseract.image_to_string(Image.open(io.BytesIO(front_bytes)))
            back_text = pytesseract.image_to_string(Image.open(io.BytesIO(back_bytes)))
        except UnidentifiedImageError:
            raise HTTPException(status_code=400, detail="Invalid image format. Please upload a valid Aadhaar image.")

        info = extract_aadhaar_info(front_text, back_text)

        name_match = None
        if name and info["name"]:
            input_name = name.lower().strip()
            ocr_name = info["name"].lower().strip()
            name_match = (input_name == ocr_name)

        return JSONResponse(content={
            "status": True,
            "data": info,
            "comparison": {
                "input_name": name,
                "ocr_name": info["name"],
                "match": name_match
            }
        })

    except HTTPException as e:
        return JSONResponse(content={"status": False, "error": e.detail})
    except Exception as e:
        return JSONResponse(content={"status": False, "error": str(e)})
