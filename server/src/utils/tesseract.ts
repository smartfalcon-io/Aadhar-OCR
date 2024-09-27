import Tesseract from "tesseract.js"

export const extractTextFromImage = async (buffer: Tesseract.ImageLike)=>{
    try {
        const {data: {text}} = await Tesseract.recognize(
            buffer,
            'eng',
          
        )
        return text;
    } catch (error) {
        console.error('Error during OCR:', error);
        throw error;
    }
}