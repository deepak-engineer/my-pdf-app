// src/app/merge-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';


export default function MergePDF() {
  const [localFiles, setLocalFiles] = useState([]);
  
  // --- USE LOCALSTORAGE HOOK FOR mergedPdfUrl ---
  const [mergedPdfUrl, setMergedPdfUrl] = useLocalStorage('mergePdfUrl', null); 
  // --- END USE LOCALSTORAGE HOOK ---
  
  const fileInputRef = useRef(null); 


  // Hook for cloud pickers
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

  // Ref to track previous allFiles length to detect a change for clearing mergedPdfUrl
  const prevAllFilesLengthRef = useRef(allFiles.length);

 


  // --- MODIFIED useEffect for managing mergedPdfUrl and clearPickedCloudFiles ---
  useEffect(() => {
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      setMergedPdfUrl(null); 
      
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles, setMergedPdfUrl]);


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setMergedPdfUrl(null); 
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles, setMergedPdfUrl]);

  const handleMerge = async () => {
    if (allFiles.length < 2) {
      alert("Please upload at least 2 PDFs to merge");
      return;
    }

    const mergedPdf = await PDFDocument.create();
    let mergeErrors = false;

    for (const file of allFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        alert(`Failed to process "${file.name}". It might be corrupted or not a valid PDF. Skipping this file.`);
        mergeErrors = true;
      }
    }

    if (mergedPdf.getPages().length < 1) {
        alert("No valid PDF pages could be merged. Please check your files.");
        setMergedPdfUrl(null);
        return;
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setMergedPdfUrl(url); 
    if (mergeErrors) {
        alert("Some files could not be merged due to errors. The merged PDF contains only the successfully processed files.");
    }
  };

  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setMergedPdfUrl(null); 
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  }, [clearPickedCloudFiles, setMergedPdfUrl]);

  return (
    <PdfToolUploader
      title="Merge PDF files"
      subtitle="Combine PDFs in the order you want with the easiest PDF merger available."
      
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
      
      actionButtons={
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full"> {/* Responsive layout for action buttons */}
          <button
            onClick={handleMerge}
            className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base flex-shrink-0" // Responsive padding/font
          >
            Merge PDFs ({allFiles.length})
          </button>
          <button
            onClick={clearAllFiles}
            className="bg-gray-300 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base flex-shrink-0" // Responsive padding/font
          >
            Clear All
          </button>
        </div>
      }
      toolSpecificContent={
        mergedPdfUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl sm:text-2xl text-green-700 mb-3">✅ Merged PDF is ready!</h2> {/* Responsive font size */}
            <iframe
              src={mergedPdfUrl}
              width="100%"
              height="300px"
              className="border rounded-lg shadow-md mb-4"
              title="Merged PDF Preview"
            ></iframe>
            <a
              href={mergedPdfUrl}
              download="merged.pdf"
              className="inline-block bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base" // Responsive padding/font
            >
              ⬇ Download Merged PDF
            </a>
          </div>
        )
      }
    />
  );
}