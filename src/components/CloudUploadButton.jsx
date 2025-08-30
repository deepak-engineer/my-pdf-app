// src/components/CloudUploadButton.js
import React from 'react';
import { FaGoogleDrive, FaDropbox } from 'react-icons/fa';

// Icon Map to dynamically select the correct FaIcon
const IconMap = {
  FaGoogleDrive: FaGoogleDrive,
  FaDropbox: FaDropbox,
};

export default function CloudUploadButton({ service, onClick, isLoading, className, title }) {
  const IconComponent = IconMap[service]; // service prop will be 'FaGoogleDrive' or 'FaDropbox'

  if (!IconComponent) {
    console.error(`Invalid icon service provided to CloudUploadButton: ${service}`);
    return null; // Or render a fallback icon
  }

  return (
    <button
      onClick={onClick}
      // --- CHANGES START HERE ---
      className={`bg-red-500 hover:bg-red-600 text-white p-2.5 sm:p-3 rounded-full shadow-sm flex items-center justify-center transition-colors duration-200 ${className || ''}`}
      title={title || `Upload from ${service.replace('Fa', '')}`}
      disabled={isLoading}
    >
      {isLoading ? (
        // Spinner size ko bhi responsive banaya hai
        <span className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        // Icon size ko bhi responsive banaya hai
        <IconComponent size={18} className="sm:text-xl" /> // text-xl is equivalent to size 20
      )}
      {/* --- CHANGES END HERE --- */}
    </button>
  );
}