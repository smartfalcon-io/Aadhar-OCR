import re
import cv2
import pytesseract
import numpy as np
from typing import Dict, Optional



def detect_and_correct_rotation(img):
    """
    Detects if image is rotated and corrects it.
    Uses text orientation detection.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    try:
        osd = pytesseract.image_to_osd(gray)
        rotation_match = re.search(r'Rotate: (\d+)', osd)
        if rotation_match:
            rotation = int(rotation_match.group(1))
            
            if rotation == 90:
                img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
            elif rotation == 180:
                img = cv2.rotate(img, cv2.ROTATE_180)
            elif rotation == 270:
                img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
                
                test_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                test_text = pytesseract.image_to_string(test_gray, config='--psm 6')[:200].upper()
                
                if 'GOVERNMENT' not in test_text and 'AADHAAR' not in test_text and 'INDIA' not in test_text:
                    img = cv2.rotate(img, cv2.ROTATE_180)
                    
    except Exception:
        height, width = img.shape[:2]
        if height > width * 1.3:
            img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
            
            test_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            test_text = pytesseract.image_to_string(test_gray, config='--psm 6')[:200].upper()
            
            if 'GOVERNMENT' not in test_text and 'AADHAAR' not in test_text and 'INDIA' not in test_text:
                img = cv2.rotate(img, cv2.ROTATE_180)
    
    return img


def preprocess_for_ocr(image_path: str):
    """
    Preprocesses the Aadhaar image for better OCR accuracy:
    - Rotation correction
    - Denoising
    - Adaptive thresholding
    """
    img = cv2.imread(image_path)
    if img is None:
        return None

    img = detect_and_correct_rotation(img)

    # Enlarge image for better OCR readability
    scale_factor = 3
    resized = cv2.resize(img, (img.shape[1] * scale_factor, img.shape[0] * scale_factor))

    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    adaptive_thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )

    return adaptive_thresh



def extract_card_info(front_text: str, back_text: str = None) -> Dict[str, Optional[str]]:
    """
    Extracts Name, DOB, Gender, and Address from OCR text.
    Handles mixed scripts, OCR noise, and both front/back Aadhaar card text.
    """
    info = {"name": None, "dob": None, "gender": None, "address": None}

    # --- Clean input text ---
    def clean_text(t: str) -> str:
        return (
            re.sub(r"[^\x20-\x7E\n]", "", t)
            .replace("|", "I")
            .replace(":", " ")
            .replace("\n", " ")
            .strip()
        )

    if not front_text:
        return info

    front_text = clean_text(front_text)
    back_text = clean_text(back_text or "")
    lines = [line.strip() for line in front_text.splitlines() if line.strip()]
    potential_names = []

    # --- NAME EXTRACTION ---
    for line_idx, line in enumerate(lines):
        matches = re.finditer(r'\b([A-Z][a-z]{2,}(?:\s+[A-Z](?:[a-z]+)?)*)\b', line)
        for match in matches:
            name = match.group(1).strip()
            name = re.sub(r'\s+[A-Z]\s*$', '', name)
            name_upper = name.upper()

            # Heuristic filters
            vowel_count = sum(1 for c in name.lower() if c in 'aeiou')
            consonant_count = sum(1 for c in name.lower() if c.isalpha() and c not in 'aeiou')
            vowel_ratio = vowel_count / max(consonant_count, 1)
            long_clusters = re.findall(r'[bcdfghjklmnpqrstvwxyz]{4,}', name.lower())

            invalid_terms = [
                "GOVERNMENT", "INDIA", "AADHAAR", "AADHAR", "PROOF", "IDENTITY", "DATE", "ISSUE", "VALID"
            ]
            if (
                len(name) >= 4
                and vowel_ratio > 0.3
                and not long_clusters
                and not any(term in name_upper for term in invalid_terms)
            ):
                score = len(name) * 5 + (len(name.split()) * 20)
                if 3 <= line_idx <= 10:
                    score += 30
                potential_names.append((name, score, line_idx))

    if potential_names:
        potential_names.sort(key=lambda x: x[1], reverse=True)
        info["name"] = potential_names[0][0]

    # --- DOB EXTRACTION ---
    dob_patterns = [
        r'(?:DOB|D\.O\.B|Date.*Birth)[:\s]*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})',
        r'\b(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{4})\b',
    ]
    for pattern in dob_patterns:
        dob_match = re.search(pattern, front_text, re.I)
        if dob_match:
            info["dob"] = dob_match.group(1).strip()
            break

    # --- GENDER EXTRACTION ---
    text_upper = front_text.upper()
    if "FEMALE" in text_upper:
        info["gender"] = "FEMALE"
    elif "MALE" in text_upper:
        info["gender"] = "MALE"
    elif re.search(r'FEMAL|FE\W*ALE|MA\W*LE', text_upper):
        info["gender"] = "FEMALE" if "FE" in text_upper else "MALE"

    # --- ADDRESS EXTRACTION (from back_text) ---
    if back_text:
        address_lines = []
        found_address = False
        for line in back_text.splitlines():
            line = line.strip()
            if not line:
                continue
            if not found_address:
                if re.search(r"Address", line, re.I) or re.match(
                    r"^(S/O|C/O|W/O|H\.?NO|Flat|Plot|Street|Village|Town|City|House|Road|Lane)",
                    line,
                    re.I,
                ):
                    found_address = True
                    line = re.sub(r"(Address|Addres)[:\-]?", "", line, flags=re.I).strip()
            if found_address:
                # Stop if 12-digit Aadhaar or 6-digit pincode appears
                if re.search(r"\d{4}\s?\d{4}\s?\d{4}", line) or re.search(r"\b\d{6}\b", line):
                    break
                address_lines.append(line)

        if address_lines:
            info["address"] = " ".join(address_lines).strip()

    print("PARSED INFO >>>", info)
    return info



def run_full_extraction(local_image_path: str):
    """
    Runs OCR with multiple configurations and merges results.
    """
    try:
        preprocessed_image = preprocess_for_ocr(local_image_path)
        if preprocessed_image is None:
            print("ERROR: Could not read or preprocess the image.")
            return

        ocr_configs = [
            ('--oem 3 --psm 6', 'Standard block mode'),
            ('--oem 3 --psm 4', 'Single column'),
            ('--oem 3 --psm 11', 'Sparse text'),
            ('--oem 3 --psm 3', 'Fully automatic'),
        ]

        all_results = []
        result_scores = {"name": -1, "dob": -1, "gender": -1}
        best_result = {"name": None, "dob": None,"gender": None}
        result_sources = {"name": None, "dob": None, "gender": None}
        
        ocr_mode_quality = {
            "Fully automatic": 100,
            "Standard block mode": 90,
            "Single column": 80,
            "Sparse text": 70
        }
        
        for config, desc in ocr_configs:
            raw_text = pytesseract.image_to_string(
                preprocessed_image, lang='eng', config=config
            )
            
            extracted_data = extract_card_info(raw_text)
            all_results.append((extracted_data, desc))
            
            mode_quality = ocr_mode_quality.get(desc, 50)
            
            for key in best_result:
                if extracted_data[key] is not None:
                    current_score = result_scores[key]
                    
                    if best_result[key] is None:
                        best_result[key] = extracted_data[key]
                        result_sources[key] = desc
                        result_scores[key] = mode_quality
                    elif mode_quality > current_score:
                        best_result[key] = extracted_data[key]
                        result_sources[key] = desc
                        result_scores[key] = mode_quality
            
            if all(best_result.values()) and desc == "Fully automatic":
                break

        print(f"\n{'='*60}")
        print("          FINAL EXTRACTED DATA")
        print(f"{'='*60}")
        print(f"Name          : {best_result.get('name') or 'NOT FOUND'}")
        
        if best_result.get('dob'):
            print(f"Date of Birth : {best_result['dob']}")
        else:
            print(f"Date of Birth : NOT FOUND")
            
        print(f"Gender        : {best_result.get('gender') or 'NOT FOUND'}")
        print(f"{'='*60}\n")

    except FileNotFoundError:
        print(f"\nERROR: File '{local_image_path}' not found.")
    except Exception as e:
        print(f"\nERROR: {e}")

