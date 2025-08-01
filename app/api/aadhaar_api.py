from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError
import pytesseract, io, re
from app.utils.ocr_utils import extract_aadhaar_info

router = APIRouter()

def normalize_dob(dob: str | None) -> str | None:
    if not dob:
        return None
    dob = str(dob).strip()
    match = re.search(r"\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b", dob)
    if match:
        return f"{match.group(1)}/{match.group(2)}/{match.group(3)}"
    return dob

@router.post("/parse-aadhar")
async def parse_aadhar(
    frontImage: UploadFile = File(...),
    backImage: UploadFile = File(...),
    firstName: str = Form(None),
    lastName: str = Form(None),
    gender: str = Form(None),
    dob: str = Form(None)
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

        print("OCR FRONT TEXT >>>", front_text)
        print("OCR BACK TEXT >>>", back_text)

        info = extract_aadhaar_info(front_text, back_text)

        combined_text = (front_text + " " + back_text).lower()
        extracted_dob = normalize_dob(info.get("dob"))
        input_dob = normalize_dob(dob)

        # build possible full names
        full_name_1 = f"{firstName or ''} {lastName or ''}".strip().lower()
        full_name_2 = f"{lastName or ''} {firstName or ''}".strip().lower()

        extracted_name = (info.get("name") or "").lower().strip()

        # compare both orders
        name_match = extracted_name == full_name_1 or extracted_name == full_name_2
        dob_match = extracted_dob and input_dob and extracted_dob == input_dob
        gender_match = gender and gender.lower() in combined_text

        if name_match and dob_match and gender_match:
            return JSONResponse(content={
                "status": True,
                "verified": True,
                "message": "Aadhaar verification successful"
            })
        else:
            return JSONResponse(content={
                "status": True,
                "verified": False,
                "message": "Aadhaar details do not match",
                "debug": {
                    "name_match": bool(name_match),
                    "dob_match": bool(dob_match),
                    "gender_match": bool(gender_match),
                    "extracted_name": extracted_name,
                    "expected_names": [full_name_1, full_name_2],
                    "extracted_info": info
                }
            })

    except HTTPException as e:
        return JSONResponse(content={"status": False, "error": e.detail})
    except Exception as e:
        return JSONResponse(content={"status": False, "error": str(e)})
