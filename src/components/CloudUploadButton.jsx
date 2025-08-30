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
      className={`bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-sm flex items-center justify-center transition-colors duration-200 ${className || ''}`}
      title={title || `Upload from ${service.replace('Fa', '')}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
      ) : (
        <IconComponent size={20} />
      )}
    </button>
  );
}