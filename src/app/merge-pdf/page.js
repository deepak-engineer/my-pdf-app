// src/app/merge-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';
import { useLocalStorage } from '@/hooks/useLocalStorage'; // <-- Import useLocalStorage hook

// Import the new reusable component
import PdfToolUploader from '@/components/PdfToolUploader';


export default function MergePDF() {
  const [localFiles, setLocalFiles] = useState([]);
  
  // --- USE LOCALSTORAGE HOOK FOR mergedPdfUrl ---
  // Key 'mergePdfUrl' unique honi chahiye har tool ke liye
  const [mergedPdfUrl, setMergedPdfUrl] = useLocalStorage('mergePdfUrl', null); 
  // --- END USE LOCALSTORAGE HOOK ---
  
  // Ab fileInputRef PdfToolUploader ko pass kiya jayega
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
  // Ye effect ab bhi yahan rahega, kyunki ye mergedPdfUrl aur overall file state ko manage karta hai.
  useEffect(() => {
    // Ye line mergedPdfUrl ko null kar degi agar allFiles.length change hota hai
    // isko ab conditionally check karna hoga, kyunki mergedPdfUrl ab localStorage se load ho raha hai
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      // Jab files change hon, toh mergedPdfUrl ko reset karna chahiye (localStorage mein bhi)
      setMergedPdfUrl(null); 
      
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles, setMergedPdfUrl]); // setMergedPdfUrl bhi dependency mein


  // --- File Handling Functions ---
  // Ye functions ab PdfToolUploader ko pass ki jayengi
  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setMergedPdfUrl(null); // File remove hone par merged URL reset
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
    setMergedPdfUrl(url); // Ye url localStorage mein save ho jayega via useLocalStorage hook
    if (mergeErrors) {
        alert("Some files could not be merged due to errors. The merged PDF contains only the successfully processed files.");
    }
  };

  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setMergedPdfUrl(null); // Clear mergedPdfUrl state and localStorage
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  }, [clearPickedCloudFiles, setMergedPdfUrl]); // setMergedPdfUrl bhi dependency mein

  return (
    <PdfToolUploader
      title="Merge PDF files"
      subtitle="Combine PDFs in the order you want with the easiest PDF merger available."
      
      // File management props
      localFiles={localFiles}
      setLocalFiles={setLocalFiles}
      allFiles={allFiles}
      removeFile={removeFile}
      clearAllFiles={clearAllFiles}
      fileInputRef={fileInputRef}

      // Cloud picker props
      isPickerLoading={isPickerLoading}
      cloudPickerError={cloudPickerError}
      openGoogleDrivePicker={openGoogleDrivePicker}
      openDropboxChooser={openDropboxChooser}
      
      // Tool-specific action buttons
      actionButtons={
        <>
          <button
            onClick={handleMerge}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
          >
            Merge PDFs ({allFiles.length})
          </button>
          <button
            onClick={clearAllFiles}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold shadow-md"
          >
            Clear All
          </button>
        </>
      }
      // Tool-specific content (e.g., merged PDF preview)
      toolSpecificContent={
        mergedPdfUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl text-green-700 mb-3">✅ Merged PDF is ready!</h2>
            {/* Note: URL.createObjectURL() based URLs will expire on page reload. 
                Downloading will only work if the original blob is somehow recreated or persisted */}
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
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md"
            >
              ⬇ Download Merged PDF
            </a>
          </div>
        )
      }
    />
  );
}