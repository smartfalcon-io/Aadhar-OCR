import { Request, Response } from 'express';
import { extractAadhaarInfo } from "../../utils/extractAdharInfo";
import { extractTextFromImage } from "../../utils/tesseract";
import { IController } from '../../interfaces/iController';
import aadharRepository from "../repository/aadharRepository";

const aadahrRepo=new aadharRepository()



type MulterFiles = {
  [fieldname: string]: Express.Multer.File[];
};

export default class Controller implements IController {
  postAadhaar = async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as MulterFiles | undefined;

      if (!files) {
        res.status(400).json({ status: false, message: "No files were uploaded." });
        return;
      }

      const frontImage = files['frontImage']?.[0];
      const backImage = files['backImage']?.[0];

      if (!frontImage || !backImage) {
        res.status(400).json({ status: false, message: "Both front side and backside images are required." });
        return;
      }

      const frontImageText = await extractTextFromImage(frontImage.buffer);
      const backImageText = await extractTextFromImage(backImage.buffer);

      const extractedInfo = extractAadhaarInfo(frontImageText, backImageText);

      if (extractedInfo) {
        // await aadahrRepo.createAadharDoc(extractedInfo)
        res.status(200).json({ status: true, data: extractedInfo, message: "Parsing successful" });
      } else {
        res.status(400).json({ status: false, message: "Failed to extract information" });
      }
    } catch (error) {
      console.error('Error parsing Aadhaar:', error);
      res.status(500).json({ status: false, message: 'Error parsing Aadhaar' });
    }
  }
}
