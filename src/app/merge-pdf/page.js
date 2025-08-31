// src/app/merge-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
// FaPlus icon is used in the merge button now.
import { FaPlus } from 'react-icons/fa'; 

// Import your custom hook
import { useCloudPickers } from '@/hooks/useCloudPickers';
// Removed: useLocalStorage import

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';


export default function MergePDF() {
  const [localFiles, setLocalFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null); 
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
      setMergedPdfUrl(null); 
      
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles]);


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setMergedPdfUrl(null); 
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles]);

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
  }, [clearPickedCloudFiles]);


  // handleAddMoreFilesClick function ab zaroorat nahi kyunki instruction card gayab ho gaya.
  // const handleInstructionAddMoreClick = () => { /* ... */ };


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
        allFiles.length > 0 && ( // Buttons sirf tab dikhe jab files selected hon
          <div className="flex flex-col items-center justify-center gap-4 mt-6 w-full">
            {/* --- REMOVED: Instruction Card for adding more files --- */}
            {/* {allFiles.length === 1 && ( 
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg text-sm max-w-sm mb-4" role="alert">
                    <p className="font-bold">Add More Files!</p>
                    <p>Please, select more PDF files by clicking again on <strong className="text-blue-800">'Select PDF files'</strong> (the <FaPlus className="inline-block" /> button on the right). </p>
                    <p>Select multiple files by maintaining pressed <strong className="text-blue-800">'Ctrl'</strong> (Windows) or <strong className="text-blue-800">'Cmd'</strong> (Mac).</p>
                </div>
            )} */}

            {/* Merge PDF Button (Moved to bottom and styled) */}
            <button
                onClick={handleMerge}
                className="bg-red-500 text-white px-8 py-4 rounded-full hover:bg-red-600 transition-colors duration-200 font-semibold text-lg shadow-xl flex items-center gap-2"
                disabled={allFiles.length < 1} // Disable if no files, or adjust based on logic
            >
                Merge PDF
                <FaPlus className="transform rotate-45" /> {/* Arrow icon for merging */}
            </button>
          </div>
        )
      }
      
      toolSpecificContent={
        mergedPdfUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl sm:text-2xl text-green-700 mb-3">✅ Merged PDF is ready!</h2>
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
              className="inline-block bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base"
            >
              ⬇ Download Merged PDF
            </a>
          </div>
        )
      }
    />
  );
}