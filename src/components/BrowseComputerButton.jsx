// src/components/BrowseComputerButton.js
'use client'
import React from 'react';
import { FaDesktop } from 'react-icons/fa'; // FaLaptop ko FaDesktop se replace kiya

export default function BrowseComputerButton({ onClick, className, title }) {
  return (
    <button
      onClick={onClick}
      className={`bg-red-500 hover:bg-red-600 text-white p-2.5 sm:p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center ${className || ''}`}
      title={title || "Upload from computer"}
    >
      <FaDesktop size={18} className="sm:text-xl" /> {/* Icon ko FaDesktop kar diya */}
    </button>
  );
}