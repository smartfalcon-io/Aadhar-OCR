import AadhaarInfo from '../interfaces/iAadhar'

export const extractAadhaarInfo = (frontText: string, backText: string) => {

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

  const dobPattern = /(?:Date of Birth|DOB) ?:? *(\d{2}\/\d{2}\/\d{4})/i;
  const dobMatch = cleanFrontText.match(dobPattern);
  info.dob = dobMatch ? dobMatch[1] : null;

  const aadhaarPattern = /(\d{4} \d{4} \d{4})/;
  const aadhaarMatch = cleanFrontText.match(aadhaarPattern);
  info.aadhaarNumber = aadhaarMatch ? aadhaarMatch[0] : null;

  const genderPattern = /Male|Female/i;
  const genderMatch = cleanFrontText.match(genderPattern);
  info.gender = genderMatch ? genderMatch[0] : null;

  const lines = cleanFrontText.split('\n');
  if (lines.length >= 4) {
    info.name = lines[3].trim(); 
  } else {
    info.name = null;
  }

  const addressPattern = /(?:S\/O|D\/O|C\/O|W\/O) ([\s\S]*?)(?:\d{6}|\n)/i;
  const addressMatch = cleanBackText.match(addressPattern);
  info.address = addressMatch ? addressMatch[1].replace(/\s+/g, ' ').trim() : cleanBackText;

  return info;
};
