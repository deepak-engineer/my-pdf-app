// src/components/PdfToolUploader.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaFilePdf, FaTimes } from "react-icons/fa";

// Import custom hook
import { useCloudPickers } from '@/hooks/useCloudPickers';

// Import reusable buttons
import CloudUploadButton from './CloudUploadButton';
import AddMoreFilesButton from "./AddMoreFiles";
import BrowseComputerButton from './BrowseComputerButton';
import PdfPreviewThumbnail from './PdfPreviewThumbnail';


export default function PdfToolUploader({
  title,
  subtitle,
  // Props for file management logic from the parent component
  localFiles,
  setLocalFiles = () => {}, // Default to an empty function
  // --- IMPORTANT: CONFIRM YE DEFAULT VALUE SET HAI ---
  allFiles = [], // Default to an empty array
  // --- END IMPORTANT ---
  removeFile,
  clearAllFiles,
  fileInputRef,
  
  // Props for cloud picker integration
  isPickerLoading,
  cloudPickerError,
  openGoogleDrivePicker,
  openDropboxChooser,

  // Tool-specific UI elements (passed as children/props)
  actionButtons,
  toolSpecificContent
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  // --- PDF.JS WORKER CONFIG ---
  useEffect(() => {
    const configurePdfJsWorker = async () => {
      if (typeof window !== 'undefined') {
        try {
          const { pdfjs } = await import('react-pdf');
          pdfjs.GlobalWorkerOptions.workerSrc = `/pdf/pdf.worker.min.js`;
          console.log("PDF.js worker configured successfully in PdfToolUploader.");
        } catch (error) {
          console.error("Failed to configure PDF.js worker in PdfToolUploader:", error);
        }
      }
    };
    configurePdfJsWorker();
  }, []); // Empty dependency array: runs once on mount of PdfToolUploader


  // --- File Handling Functions ---
  const handleLocalFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    if (selectedFiles.length > 0) {
      setLocalFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      setLocalFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-4xl w-full relative">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{title}</h1>
        <p className="text-gray-600 mb-8 text-lg">{subtitle}</p>

        {cloudPickerError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {cloudPickerError}</span>
          </div>
        )}

        {/* Hidden file input element for local files */}
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleLocalFileChange}
          ref={fileInputRef}
          className="hidden"
        />

        {/* --- Floating Action Buttons (FAB) --- */}
        {/* allFiles ab guaranteed ek array hai, so .length is safe */}
        {allFiles.length > 0 && (
          <div
            className="fixed right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50"
            onMouseEnter={() => setIsFabMenuOpen(true)}
            onMouseLeave={() => setIsFabMenuOpen(false)}
          >
            <AddMoreFilesButton
              onClick={handleButtonClick}
              fileCount={allFiles.length}
              title="Add more PDF files from computer"
            />
            <div className={`flex flex-col gap-3 transition-opacity duration-300 ${isFabMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <BrowseComputerButton
                onClick={handleButtonClick}
              />
              <CloudUploadButton
                service="FaGoogleDrive"
                onClick={openGoogleDrivePicker}
                isLoading={isPickerLoading}
              />
              <CloudUploadButton
                service="FaDropbox"
                onClick={openDropboxChooser}
                isLoading={isPickerLoading}
              />
            </div>
          </div>
        )}

        {/* --- Main Content Area --- */}
        {/* allFiles ab guaranteed ek array hai, so .length is safe */}
        {allFiles.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center p-12 border-2 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg transition-all duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <button
                onClick={handleButtonClick}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-colors duration-200 text-lg flex-shrink-0"
              >
                Select PDF files
              </button>
              <div className="flex flex-row sm:flex-col gap-2">
                <CloudUploadButton
                  service="FaGoogleDrive"
                  onClick={openGoogleDrivePicker}
                  isLoading={isPickerLoading}
                />
                <CloudUploadButton
                  service="FaDropbox"
                  onClick={openDropboxChooser}
                  isLoading={isPickerLoading}
                />
              </div>
            </div>
            <p className="text-gray-500 text-sm">or drop PDFs here</p>
          </div>
        ) : (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Selected PDFs ({allFiles.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50">
              {allFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative border p-3 rounded-lg shadow-sm flex flex-col items-center bg-white"
                >
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 z-10"
                    title="Remove file"
                  >
                    <FaTimes size={10} />
                  </button>
                  <div className="mb-2 w-24 h-32 flex items-center justify-center border rounded-md overflow-hidden bg-gray-100">
                    <PdfPreviewThumbnail file={file} />
                  </div>
                  <FaFilePdf className="text-red-600 text-xl mb-1" />
                  <p className="text-sm text-gray-600 text-center truncate w-28">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>

            {actionButtons && <div className="flex justify-center gap-4 mt-6">{actionButtons}</div>}
          </div>
        )}

        {toolSpecificContent}

      </div>
    </div>
  );
}