'use client'
import React from 'react';
import { FaPlus } from 'react-icons/fa';

export default function AddMoreFilesButton({ onClick, fileCount, className, title }) {
  return (
    <button
      onClick={onClick}
      className={`relative bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center ${className || ''}`}
      title={title || "Add more PDF files"}
    >
      <FaPlus size={24} />
      {fileCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {fileCount}
        </span>
      )}
    </button>
  );
}