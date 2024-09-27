import { Request, Response } from 'express';
import { extractAadhaarInfo } from "../../utils/extractAdharInfo";
import { extractTextFromImage } from "../../utils/tesseract";

export default class Controller {
  postAadhaar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const frontImage = Array.isArray(req.files) ? req.files[0] : req.files?.['frontImage']?.[0] || null;
      const backImage = Array.isArray(req.files) ? req.files[1] : req.files?.['backImage']?.[0] || null;

      if (!frontImage || !backImage) {
        return res.status(400).json({ status: false, message: "Both front side and backside images are required." });
      }

      const frontImageText = await extractTextFromImage(frontImage.buffer);
      const backImageText = await extractTextFromImage(backImage.buffer);

      const extractedInfo = extractAadhaarInfo(frontImageText, backImageText);

      if (extractedInfo) {
        return res.status(200).json({ status: true, data: extractedInfo, message: "Parsing successful" });
      } else {
        return res.status(400).json({ status: false, message: "Failed to extract information" });
      }
    } catch (error) {
      console.error('Error parsing Aadhaar:', error);
      return res.status(500).json({ status: false, message: 'Error parsing Aadhaar' });
    }
  }
}
