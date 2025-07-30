import { Request, Response } from 'express';
import { extractTextFromImage } from "../../utils/tesseract";
import { IController } from '../../interfaces/iController';




type MulterFiles = {
	[fieldname: string]: Express.Multer.File[];
};

type Name = {
	exists: boolean
}

export default class Controller implements IController {
	postAadhaar = async (req: Request, res: Response): Promise<void> => {
		try {
			const files = req.files as MulterFiles | undefined;
			const name: string = req.body.name

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

			let frontImageText = await extractTextFromImage(frontImage.buffer);
			let backImageText = await extractTextFromImage(backImage.buffer);


			console.info(`frontImageText contains Name: ${name}: ${frontImageText.toLowerCase().includes(name.toLowerCase())}`)

			// const extractedInfo = extractAadhaarInfo(frontImageText, backImageText);

			if (frontImageText.toLowerCase().includes(name.toLowerCase())) {
				res.status(200).json({ status: true, data: { contains: true }, message: "Aadhaar contains name" });
			} else {
				res.status(200).json({ status: true, data: { contains: false }, message: "Aadhaar does not contain name" });
			}
		} catch (error) {
			console.error('Error parsing Aadhaar:', error);
			res.status(500).json({ status: false, message: 'Error parsing Aadhaar' });
		}
	}
}
