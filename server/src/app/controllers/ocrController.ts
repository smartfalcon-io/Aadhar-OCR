import { Request, Response } from 'express';
import { extractTextFromImage } from "../../utils/tesseract";
import { IController } from '../../interfaces/iController';
import { extractAadhaarInfo } from '../../utils/extractAdharInfo';




type MulterFiles = {
	[fieldname: string]: Express.Multer.File[];
};


export default class Controller implements IController {
	postAadhaar = async (req: Request, res: Response): Promise<void> => {
		try {
			const files = req.files as MulterFiles | undefined;
			const name: string = req.body.name
			const gender: string = req.body.gender
			const dob: string = req.body.dob

			if (!files) {
				res.status(400).json({ status: false, message: "No files were uploaded." });
				return;
			}

			const frontImage = files['frontImage']?.[0];
			console.info(`frontImage Size: ${(frontImage.size) / (1024 * 1024)}`)
			const backImage = files['backImage']?.[0];

			if (!frontImage || !backImage) {
				res.status(400).json({ status: false, message: "Both front side and backside images are required." });
				return;
			}

			let frontImageText = await extractTextFromImage(frontImage.buffer);
			let backImageText = await extractTextFromImage(backImage.buffer);


			console.info(`frontImageText contains Name: ${name}: ${frontImageText.toLowerCase().includes(name.toLowerCase())}`)
			console.info(`frontImageText contains gender: ${gender}: ${frontImageText.toLowerCase().includes(gender.toLowerCase())}`)

			const extractedInfo = extractAadhaarInfo(frontImageText, backImageText);

			if (frontImageText.toLowerCase().includes(name.toLowerCase()) &&
				// (extractedInfo.name?.toLowerCase() == name.toLowerCase()) && 
				(extractedInfo.dob == dob || extractedInfo.dob == getYearFromDateString(dob)) && (extractedInfo.gender?.toLowerCase() == gender.toLowerCase())) {
				res.status(200).json({ status: true, verified: true, data: extractedInfo, message: "Aadhaar contains name" });
			} else {
				res.status(200).json({ status: true, verified: false, message: "Aadhaar does not contain name" });
			}
		} catch (error) {
			console.error('Error parsing Aadhaar:', error);
			res.status(500).json({ status: false, message: 'Error parsing Aadhaar' });
		}
	}
}


function getYearFromDateString(dateString: string): number | null {
	const parts = dateString.split('/');
	if (parts.length === 3) {
		const year = parseInt(parts[2], 10);
		if (!isNaN(year)) {
			return year;
		}
	}
	return null; // Return null for invalid format
}
