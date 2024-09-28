import React, { useRef, useState } from 'react';
import { useParseAadharMutation } from '../api/axiosApi';
import { toast, Toaster } from 'sonner';
import { setParsedData,setLoading } from '../stores/aadharSlice';
import { useDispatch } from 'react-redux';

const UploadSection: React.FC = () => {
  const [frontImage, setFrontImg] = useState<string | ArrayBuffer | null>(null);
  const [backImage, setBackImg] = useState<string | ArrayBuffer | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const dispatch = useDispatch()

  const [parseAadhar, { isLoading }] = useParseAadharMutation();

  const fileInputRefFront = useRef<HTMLInputElement>(null);
  const fileInputRefBack = useRef<HTMLInputElement>(null);

  const handleImageFront = () => {
    if (fileInputRefFront.current) {
      fileInputRefFront.current.click();
    }
  };

  const handleImageBack = () => {
    if (fileInputRefBack.current) {
      fileInputRefBack.current.click();
    }
  };

  const handleImageFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFrontFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFrontImg(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Only image files are allowed!');
      }
    }
  };

  if(isLoading){
    dispatch(setLoading(true))
  }

  const handleImageBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxFileSize = 30 * 1024 * 1024;

      if (file.size > maxFileSize) {
        toast.error('File size should not exceed 30 MB!');
        return;
      }

      if (file.type.startsWith('image/')) {
        setBackFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setBackImg(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Only image files are allowed!');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!frontFile || !backFile) {
        toast.error('Add both front side and back side of aadhaar');
      } else {
        dispatch(setParsedData(null))
        const response = await parseAadhar({
          frontImage: frontFile,
          backImage: backFile,
        }).unwrap();
        if(response.status){
    dispatch(setParsedData(response.data));
    dispatch(setLoading(false))
    toast.success('Aadhaar parsed successfully');

        }

      }
    } catch (error) {
      console.log('Error occurred while submitting', error);
      toast.error('Failed to parse Aadhaar');
    }
  };

  return (
    <div className="flex-1 space-y-10 w-full lg:w-auto">
      <Toaster position="top-center" expand={false} richColors />
      <div>
        <h2 className="font-medium pl-2 pb-3">Aadhaar Front</h2>
        <div
          className="bg-white w-full lg:w-96 h-auto p-4 text-center cursor-pointer rounded-md shadow-shadowAll"
          onClick={handleImageFront}
        >
          {frontImage ? (
            <img
              src={frontImage as string}
              alt="frontImg"
              className="h-36 rounded-md mx-auto"
            />
          ) : (
            <img src="/path/to/upload-icon.png" alt="upload" className="mx-auto w-10 h-8" />
          )}
          <p className={`text-blue-500 ${frontImage ? 'bg-slate-200 hover:bg-slate-300 rounded-xl mt-4' : 'mt-2'}`}>
            {frontImage ? 'Change image' : 'Click here to Upload/Capture'}
          </p>
          <input
            type="file"
            className="hidden"
            ref={fileInputRefFront}
            onChange={handleImageFrontChange}
          />
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-medium pl-2 pb-3">Aadhaar Back</h2>
        <div
          className="bg-white w-full lg:w-96 h-auto p-4 text-center cursor-pointer rounded-md shadow-shadowAll"
          onClick={handleImageBack}
        >
          {backImage ? (
            <img
              src={backImage as string}
              alt="backimg"
              className="h-36 rounded-md mx-auto"
            />
          ) : (
            <img src="/path/to/upload-icon.png" alt="upload" className="mx-auto w-10 h-8" />
          )}
          <p className={`text-blue-500 ${backImage ? 'bg-slate-200 hover:bg-slate-300 rounded-xl mt-4' : 'mt-2'}`}>
            {backImage ? 'Change image' : 'Click here to Upload/Capture'}
          </p>
          <input
            type="file"
            className="hidden"
            ref={fileInputRefBack}
            onChange={handleImageBackChange}
          />
        </div>
      </div>
      <div onClick={handleSubmit} className="flex bg-blue-400 mt-5 p-2 w-full lg:w-96 rounded-xl cursor-pointer hover:bg-blue-500">
        {!isLoading ? (
          <button className="mx-auto font-semibold text-white">
            PARSE AADHAAR
          </button>
        ) : (
          <ul className="max-w-md space-y-2 text-white list-inside dark:text-white mx-auto cursor-not-allowed">
            <li className="flex items-center mx-auto">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 me-2 text-white animate-spin dark:text-white fill-blue-600 mx-auto"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2915 88.181 35.8757C89.083 38.264 91.5423 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only mx-auto">Loading...</span>
              </div>
              <span>Parsing Aadhaar</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default UploadSection;