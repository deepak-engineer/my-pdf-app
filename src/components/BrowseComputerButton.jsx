// src/components/BrowseComputerButton.js
import React from 'react';
import { FaLaptop } from 'react-icons/fa';

export default function BrowseComputerButton({ onClick, className, title }) {
  return (
    <button
      onClick={onClick}
      // --- CHANGES START HERE ---
      className={`bg-red-500 hover:bg-red-600 text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center ${className || ''}`}
      title={title || "Upload from computer"}
    >
      <FaLaptop size={18} className="sm:text-xl" /> {/* Icon size ko responsive banaya */}
      {/* --- CHANGES END HERE --- */}
    </button>
  );
}