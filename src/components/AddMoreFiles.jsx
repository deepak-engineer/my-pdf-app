// src/components/AddMoreFilesButton.js
'use client'
import React from 'react';
import { FaPlus } from 'react-icons/fa';

export default function AddMoreFilesButton({ onClick, fileCount, className, title }) {
  return (
    <button
      onClick={onClick}
      // --- CHANGES START HERE ---
      // Button padding ko responsive banaya
      className={`relative bg-red-500 hover:bg-red-600 text-white p-3 sm:p-4 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center ${className || ''}`}
      title={title || "Add more PDF files"}
    >
      {/* Plus icon size ko responsive banaya */}
      <FaPlus size={20} className="sm:text-2xl" /> {/* text-2xl is equivalent to size 24 */}
      {fileCount > 0 && (
        // Badge size aur font size ko responsive banaya
        <span className="absolute -top-1 -right-1 bg-black text-white text-xs sm:text-sm font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
          {fileCount}
        </span>
      )}
      {/* --- CHANGES END HERE --- */}
    </button>
  );
}