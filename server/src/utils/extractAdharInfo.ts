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
  const dobPattern = /(?:Date of Birth|DOB) ?:? *(\d{2}\/\d{2}\/\d{4})/i;
  const dobMatch = cleanFrontText.match(dobPattern);
  info.dob = dobMatch ? dobMatch[1] : null;

  // Extract Aadhaar Number
  const aadhaarPattern = /(\d{4} \d{4} \d{4})/;
  const aadhaarMatch = cleanFrontText.match(aadhaarPattern);
  info.aadhaarNumber = aadhaarMatch ? aadhaarMatch[1] : null;

  // Extract Gender
  const genderPattern = /\b(Male|Female)\b/i;
  const genderMatch = cleanFrontText.match(genderPattern);
  info.gender = genderMatch ? genderMatch[1] : null;

  // Extract Name
  const namePattern = /Govemnmentofindia\s+e\s+g\s+5\s+([A-Z][a-z]+(?:\s+[A-Z]){1,2})/;
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