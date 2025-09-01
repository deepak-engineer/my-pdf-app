// src/app/compress-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
// PDFDocument ab yahan directly nahi chahiye
// import { PDFDocument } from "pdf-lib"; 
import { FaCompress } from "react-icons/fa"; // FaCompress icon for the button

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';


export default function CompressPDF() {
  const [localFiles, setLocalFiles] = useState([]);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null); // URL for the compressed PDF
  const [compressionRatio, setCompressionRatio] = useState(0); // Compression percentage
  
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
      setCompressedPdfUrl(null); // Clear compressed PDF if input files change
      setCompressionRatio(0); // Reset ratio
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles, setCompressedPdfUrl]); // Added setCompressedPdfUrl to dependencies


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setCompressedPdfUrl(null); // Clear compressed PDF when a file is removed
    setCompressionRatio(0); // Reset ratio
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles, setCompressedPdfUrl]);

  const handleCompressPdf = async () => {
    if (allFiles.length === 0) {
      alert("Please upload a PDF file to compress.");
      return;
    }
    if (allFiles.length > 1) {
      alert("Please select only one PDF file to compress at a time.");
      return;
    }

    setCompressedPdfUrl(null); // Clear previous compressed PDF
    setCompressionRatio(0); // Reset ratio

    const pdfFile = allFiles[0];
    const formData = new FormData();
    formData.append('pdfFile', pdfFile);

    try {
      const response = await fetch('/api/compress-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compress PDF on server.');
      }

      const blob = await response.blob();
      // Get compression ratio from response headers if available
      const ratio = response.headers.get('X-Compression-Ratio');
      if (ratio) {
        setCompressionRatio(parseFloat(ratio));
      }

      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);

    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setCompressedPdfUrl(null); // Clear compressed PDF URL
    setCompressionRatio(0); // Reset ratio
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  }, [clearPickedCloudFiles]);


  return (
    <PdfToolUploader
      title="Compress PDF"
      subtitle="Reduce file size while optimizing for maximal PDF quality."
      
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
        allFiles.length === 1 && ( // Show action buttons if one PDF is uploaded
          <div className="flex flex-col items-center justify-center gap-4 mt-6 w-full p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Compress PDF</h3>
            
            <button
                onClick={handleCompressPdf}
                className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base flex-shrink-0 flex items-center gap-2"
                disabled={allFiles.length === 0}
            >
                Compress PDF <FaCompress />
            </button>
            <button
                onClick={clearAllFiles}
                className="bg-gray-300 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base flex-shrink-0"
            >
                Clear All
            </button>
          </div>
        )
      }
      // Tool-specific content (compressed PDF preview)
      toolSpecificContent={
        compressedPdfUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl sm:text-2xl text-green-700 mb-3">✅ Your PDF has been compressed!</h2>
            {compressionRatio > 0 && (
              <p className="text-green-800 text-lg mb-3">
                Compressed by: <span className="font-semibold">{compressionRatio.toFixed(2)}%</span>
              </p>
            )}
            <iframe
              src={compressedPdfUrl}
              width="100%"
              height="300px"
              className="border rounded-lg shadow-md mb-4"
              title="Compressed PDF Preview"
            ></iframe>
            <a
              href={compressedPdfUrl}
              download="compressed_pdf.pdf"
              className="inline-block bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base"
            >
              ⬇ Download Compressed PDF
            </a>
          </div>
        )
      }
    />
  );
}