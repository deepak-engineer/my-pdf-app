// src/app/ppt-to-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
// pdfjsLib import ki yahan zaroorat nahi, PdfToolUploader aur PdfPreviewThumbnail handle karte hain.
// import * as pdfjsLib from "pdfjs-dist"; 
// pptxgenjs import ki ab yahan zaroorat nahi, server-side API use karega.
// import PptxGenJS from 'pptxgenjs'; 
import { FaFilePdf, FaSpinner, FaServer } from "react-icons/fa"; // FaServer icon
import { FaFilePowerpoint } from 'react-icons/fa'; // FaFilePowerpoint icon

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';


export default function PptToPdf() {
  const [localFiles, setLocalFiles] = useState([]);
  const [pdfFileUrl, setPdfFileUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  
  const fileInputRef = useRef(null); 

  const {
    isPickerLoading,
    pickedCloudFiles,
    error: cloudPickerError,
    openGoogleDrivePicker,
    openDropboxChooser,
    clearPickedCloudFiles,
    setPickedCloudFiles
  } = useCloudPickers();

  const allFiles = [...localFiles, ...pickedCloudFiles];

  const prevAllFilesLengthRef = useRef(allFiles.length);

  useEffect(() => {
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      setPdfFileUrl(null); 
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles, setPdfFileUrl]);


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setPdfFileUrl(null); 
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles, setPdfFileUrl]);

  // --- Server-side PPTX to PDF Conversion ---
  const handlePptToPdf = async () => {
    if (allFiles.length === 0) {
      alert("Please upload a PPTX file to convert to PDF.");
      return;
    }
    if (allFiles.length > 1) {
      alert("Please select only one PPTX file to convert at a time.");
      return;
    }

    setPdfFileUrl(null); 
    setIsConverting(true); 

    const pptxFile = allFiles[0];
    const formData = new FormData();
    formData.append('pptxFile', pptxFile);

    try {
      const response = await fetch('/api/ppt-to-pdf-server', { // Call the server API
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await responseData.json(); // response.json() should be awaited
        throw new Error(errorData.error || 'Failed to convert PPTX to PDF on server.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfFileUrl(url);

    } catch (error) {
      console.error('Error converting PPTX to PDF (Server-side):', error);
      let errorMessage = "An unknown error occurred during PPTX to PDF conversion.";
      if (error instanceof Error) {
          errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = error.message;
      } else if (typeof error === 'string') {
          errorMessage = error;
      }

      alert(`Error converting PPTX to PDF: ${errorMessage}. (Note: This conversion uses a headless browser and current setup provides a placeholder PDF, not the actual PPTX content.)`);
    } finally {
      setIsConverting(false); 
    }
  };


  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setPdfFileUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  }, [clearPickedCloudFiles]);


  return (
    <PdfToolUploader
      title="PowerPoint to PDF"
      subtitle="Convert your PowerPoint presentations to PDF (Image-based conversion via server)."
      
      localFiles={localFiles}
      setLocalFiles={setLocalFiles}
      allFiles={allFiles}
      removeFile={removeFile}
      clearAllFiles={clearAllFiles}
      fileInputRef={fileInputRef}

      isPickerLoading={isPickerLoading}
      cloudPickerError={cloudPickerError}
      openGoogleDrivePicker={openGoogleDrivePicker}
      openDropboxChooser={openDropboxChooser}
      // --- IMPORTANT CHANGE: Naye props add kiye hain ---
      selectButtonText="Select Powerpoint files" // Button text
      acceptedFileTypes="application/vnd.openxmlformats-officedocument.presentationml.presentation" // .pptx mime type
      // --- END IMPORTANT CHANGE ---
      
      actionButtons={
        allFiles.length === 1 && ( 
          <div className="flex flex-col items-center justify-center gap-4 mt-6 w-full p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Convert PowerPoint to PDF</h3>
            
            <button
                onClick={handlePptToPdf}
                className="bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 flex-grow sm:flex-grow-0"
                disabled={allFiles.length === 0 || isConverting}
            >
                {isConverting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    Convert to PDF <FaFilePdf />
                  </>
                )}
            </button>
            
            <button
                onClick={clearAllFiles}
                className="bg-gray-300 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold text-sm sm:text-base flex-shrink-0 mt-2"
                disabled={isConverting}
            >
                Clear All
            </button>
          </div>
        )
      }
      // Tool-specific content (generated PDF file download link)
      toolSpecificContent={
        pdfFileUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl sm:text-2xl text-green-700 mb-3">✅ Your PowerPoint has been converted to PDF!</h2>
            <p className="text-sm text-gray-700 mb-4">
              (Note: This conversion uses a headless browser to print a rendered page. The generated PDF is a placeholder, as directly rendering PPTX in a browser for printing is complex.)
            </p>
            <iframe
              src={pdfFileUrl}
              width="100%"
              height="300px"
              className="border rounded-lg shadow-md mb-4"
              title="Converted PDF Preview"
            ></iframe>
            <a
              href={pdfFileUrl}
              download="converted_presentation.pdf"
              className="inline-block bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
            >
              ⬇ Download PDF File <FaFilePdf />
            </a>
          </div>
        )
      }
    />
  );
}