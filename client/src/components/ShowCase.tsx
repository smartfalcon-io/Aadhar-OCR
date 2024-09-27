import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../stores/store'; 



const ShowCase: React.FC = () => {
  const { aadharDetails, isLoading } = useSelector((state: RootState) => state.aadharSlice);

  const ShimmerEffect = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <ShimmerEffect />;
    }

    if (!aadharDetails) {
      return <p className="text-gray-500">No Aadhaar data available. Please upload and parse an Aadhaar card.</p>;
    }

    return (
      <form className="max-w-md mx-auto p-7 space-y-6">
        <div className="grid md:grid-cols-2 md:gap-6">
          <InputField label="Aadhaar Number" value={aadharDetails.aadhaarNumber} />
          <InputField label="Aadhaar Name" value={aadharDetails.name} />
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <InputField label="Date of Birth" value={aadharDetails.dob} />
          <InputField label="Gender" value={aadharDetails.gender} />
        </div>
        <InputField label="Address" value={aadharDetails.address} />
      </form>
    );
  };

  return (
    <div className="flex-1 w-full lg:w-auto mt-10 lg:mt-10 shadow-shadowAll p-5">
      <h3 className="font-medium underline flex justify-center">Response</h3>
      {renderContent()}
    </div>
  );
};

const InputField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="relative z-0 w-full mb-5 group">
    <input
      type="text"
      value={value}
      className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-black dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      placeholder=" "
      readOnly
    />
    <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
      {label}
    </label>
  </div>
);

export default ShowCase;