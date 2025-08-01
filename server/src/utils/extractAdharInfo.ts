import AadhaarInfo from '../interfaces/iAadhar'

export const extractAadhaarInfo = (frontText: string, backText: string): AadhaarInfo => {
  const info: AadhaarInfo = {
    dob: null,
    aadhaarNumber: null,
    gender: null,
    name: null,
    address: null,
  };
  

  const cleanText = (text: string) => text.replace(/\s+/g, ' ').trim();
  const cleanFrontText = cleanText(frontText);
  const cleanBackText = cleanText(backText);

  console.log(cleanFrontText);
  

  // Extract DOB
  // Updated to match both DD/MM/YYYY and YYYY formats, and "Year of Birth" prefix
  // Extract DOB
if (cleanFrontText.includes("Date of Birth") || cleanFrontText.includes("DOB")){
	  const dobPattern = /(?:Date of Birth|DOB) ?:? *(\d{2}\/\d{2}\/\d{4})/i;
	  const dobMatch = cleanFrontText.match(dobPattern);
	  info.dob = dobMatch ? dobMatch[1] : null;
} 
if (cleanFrontText.includes("Year of Birth")){
	console.log("testing")
	const dobPattern = /(?:Date of Birth|DOB|Y.*?ar of Birth)[: ]?\s*(\d{2}\/\d{2}\/\d{4}|\d{4})/i;
	const dobMatch = cleanFrontText.match(dobPattern);
	info.dob = dobMatch ? dobMatch[1] : null;
}

  // Extract Aadhaar Number (retained from previous version, as it was not part of the current request to change)
  // Extract Aadhaar Number
  const aadhaarPattern = /(\d{4} \d{4} \d{4})/;
  const aadhaarMatch = cleanFrontText.match(aadhaarPattern);
  info.aadhaarNumber = aadhaarMatch ? aadhaarMatch[1] : null;

  // Extract Gender
  const genderPattern = /\b(Male|Female|Transgender)\b/i;
  const genderMatch = cleanFrontText.match(genderPattern);
  info.gender = genderMatch ? genderMatch[1] : null;

  // Extract Name
  // Updated pattern to flexibly capture names after common prefixes, expecting at least two words
  const namePattern = /(?:z\s*\|\s*|T8\s*86\s*\.?\s*)([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,})/i;
  const nameMatch = cleanFrontText.match(namePattern);
  info.name = nameMatch ? nameMatch[1].trim() : null;

  // Extract Address
  const addressPattern = /Address:\s*([\s\S]*?)(?:\d{6}|$)/i;
  const addressMatch = cleanBackText.match(addressPattern);
  if (addressMatch) {
    info.address = cleanText(addressMatch[1])
      .replace(/[^\w\s,.-]/g, '') // Remove unwanted characters
      .replace(/\s+/g, ' ')
      .trim();
  }
console.log(info);

  return info;
};
