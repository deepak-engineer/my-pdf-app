// src/components/PdfToolUploader.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { FaFilePdf, FaTimes } from "react-icons/fa";


// Import reusable buttons
import CloudUploadButton from './CloudUploadButton';
import AddMoreFilesButton from "./AddMoreFiles";
import BrowseComputerButton from './BrowseComputerButton';

// Dynamically import react-pdf components inside this reusable component
// This ensures that Document and Page are only loaded on the client-side
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

export default function PdfToolUploader({
  title,
  subtitle,
  // Props for file management logic from the parent component
  localFiles,
  setLocalFiles,
  allFiles,
  removeFile,
  clearAllFiles,
  
  // Props for cloud picker integration
  isPickerLoading,
  cloudPickerError,
  openGoogleDrivePicker,
  openDropboxChooser,

  // Tool-specific UI elements (passed as children/props)
  actionButtons, // e.g., Merge PDFs button, Split PDFs button
  toolSpecificContent // e.g., Merged PDF Preview, Split options
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false); // State for FAB menu

  // --- PDF.JS WORKER CONFIG (Should run only once on client-side) ---
  useEffect(() => {
    const configurePdfJs = async () => {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `/pdf/pdf.worker.min.js`;
    };
    configurePdfJs();
  }, []);
  // --- END OF PDF.JS WORKER CONFIG ---


  // --- File Handling Functions ---
  // These functions are lifted up from the parent component but are still needed here for UI interactions
  const handleLocalFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    if (selectedFiles.length > 0) {
      setLocalFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleButtonClick = () => { // Triggers hidden file input
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

        {/* --- Floating Action Buttons (FAB) - Dikhenge jab files selected hon --- */}
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
            {/* Conditional rendering for other buttons based on hover state */}
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

        {/* --- Main Content Area: Renders differently based on whether files are selected --- */}
        {allFiles.length === 0 ? (
          // Initial state: Show large "Select PDF files" button and drag/drop area
          <div
            className={`flex flex-col items-center justify-center p-12 border-2 ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'} rounded-lg transition-all duration-200`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handleButtonClick}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg shadow-md transition-colors duration-200 text-lg"
              >
                Select PDF files
              </button>
              {/* Cloud service buttons - Jab koi file select na ho tab bhi dikhenge (RED color mein) */}
              <div className="flex flex-col gap-2">
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
          // Files are selected: Show previews, tool-specific action buttons, and clear buttons
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
                    {Document && Page && file.type === 'application/pdf' ? (
                      <Document file={file} loading="Loading preview..." className="w-full h-full">
                        <Page pageNumber={1} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
                      </Document>
                    ) : (
                      <FaFilePdf className="text-red-400 text-4xl" />
                    )}
                  </div>
                  <FaFilePdf className="text-red-600 text-xl mb-1" />
                  <p className="text-sm text-gray-600 text-center truncate w-28">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Tool-specific action buttons (Merge, Split, Compress) */}
            {actionButtons && <div className="flex justify-center gap-4 mt-6">{actionButtons}</div>}
          </div>
        )}

        {/* Tool-specific content (Merged PDF preview, Split options, etc.) */}
        {toolSpecificContent}

      </div>
    </div>
  );
}