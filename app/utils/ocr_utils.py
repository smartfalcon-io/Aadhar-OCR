import re
from typing import Dict, Optional

def extract_aadhaar_info(front_text: str, back_text: str) -> Dict[str, Optional[str]]:
    info = {"name": None, "dob": None, "gender": None, "address": None}

    # Utility: clean and normalize text
    def clean(text: str) -> str:
        return (
            re.sub(r"[^\x20-\x7E\n]", "", text)  # remove non-ASCII
            .replace("\n", " ")
            .strip()
        )

    def normalize_digits(text: str) -> str:
        return (
            text.replace("O", "0")
            .replace("I", "1")
            .replace("l", "1")
            .replace("|", "1")
        )

    front = clean(front_text)
    back = clean(back_text)

    print("OCR FRONT TEXT >>>", front)
    print("OCR BACK TEXT >>>", back)

    # Aadhaar number
    aadhaar_match = re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", normalize_digits(front))
    if aadhaar_match:
        print("Aadhaar Number Found:", aadhaar_match.group())

    # Gender
    gender_match = re.search(r"\b(MALE|FEMALE|M|F)\b", front, re.I)
    if gender_match:
        g = gender_match.group().upper()
        info["gender"] = "FEMALE" if g.startswith("F") else "MALE"

    # Name extraction (line above DOB)
    lines = [line.strip() for line in front_text.splitlines() if line.strip()]
    dob_pattern = re.compile(
        r"(?:DOB|Date of Birth)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
        re.I,
    )
    dob_line_index = next(
        (i for i, line in enumerate(lines) if dob_pattern.search(line)), -1
    )

    if dob_line_index > 0:
        possible_name = re.sub(r"^[^A-Za-z]+", "", lines[dob_line_index - 1]).strip()
        name_match = re.match(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+", possible_name)
        info["name"] = name_match.group() if name_match else possible_name

    # DOB
    dob_match = dob_pattern.search(front)
    if dob_match:
        info["dob"] = dob_match.group(1)

    # Address Extraction
    address_lines = []
    found_address = False

    for line in back_text.splitlines():
        line = line.strip()
        if not line:
            continue

        # Start capturing when "Address" or typical Aadhaar prefixes are found
        if not found_address:
            if re.search(r"Address", line, re.I) or re.match(
                r"^(S/O|C/O|W/O|H\.?NO|HNO|Flat|Plot|Street|Village|Town|City|Door No|D\.No|House|Road|Lane|Near|PO|PS|Dist|Mandal|Tehsil)",
                line,
                re.I,
            ):
                found_address = True
                line = re.sub(r"(Address|Addres)[:\-]?", "", line, flags=re.I).strip()

        if found_address:
            # Stop capturing at Aadhaar number, India, or PIN code
            if (
                re.search(r"\d{4}\s?\d{4}\s?\d{4}", line)
                or re.search(r"\bIndia\b", line, re.I)
                or re.search(r"\b\d{6}\b", line)  # 6-digit PIN code
            ):
                break
            address_lines.append(line)

    if address_lines:
        address = " ".join(address_lines)
        address = re.sub(r"[^\w\s,.-]", "", address)  # clean unwanted chars
        info["address"] = re.sub(r"\s+", " ", address).strip()
    else:
        # Fallback: pick the 3 longest lines from back_text
        candidate_lines = sorted(
            [l.strip() for l in back_text.splitlines() if len(l.strip()) > 6],
            key=len,
            reverse=True,
        )
        if candidate_lines:
            info["address"] = ", ".join(candidate_lines[:3])

    print("PARSED INFO >>>", info)
    return info
