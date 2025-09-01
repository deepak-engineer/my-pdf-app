// src/app/pdf-to-powerpoint/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist"; // Directly import pdfjs-dist for client-side PDF rendering
import PptxGenJS from 'pptxgenjs'; // pptxgenjs library for client-side PPTX generation
import { FaFilePowerpoint, FaSpinner, FaLaptop } from "react-icons/fa"; // FaLaptop icon for client-side conversion

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';

// Global worker setup for pdfjs-dist (for client-side PDF rendering)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf/pdf.worker.min.js`;
}

export default function PdfToPowerpoint() {
  const [localFiles, setLocalFiles] = useState([]);
  const [pptxFileUrl, setPptxFileUrl] = useState(null);
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
      setPptxFileUrl(null);
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles, setPptxFileUrl]);


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setPptxFileUrl(null);
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles, setPptxFileUrl]);

  // --- Client-side PDF to PowerPoint Conversion ---
  const handlePdfToPpt = async () => {
    if (allFiles.length === 0) {
      alert("Please upload a PDF file to convert to PowerPoint.");
      return;
    }
    if (allFiles.length > 1) {
      alert("Please select only one PDF file to convert at a time.");
      return;
    }

    setPptxFileUrl(null);
    setIsConverting(true); 

    const pdfFile = allFiles[0];

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer }); // pdfjsLib is client-side
      const pdf = await loadingTask.promise;
      
      const pptx = new PptxGenJS(); // pptxgenjs is client-side
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        const imageDataUrl = canvas.toDataURL('image/png');

        const slide = pptx.addSlide();
        slide.addImage({
          data: imageDataUrl,
          x: 0,
          y: 0,
          w: '100%',
          h: '100%',
        });
      }

      const pptxBlob = await pptx.write({ outputType: 'blob' });
      const url = URL.createObjectURL(pptxBlob);
      setPptxFileUrl(url);

    } catch (error) {
      console.error('Error converting PDF to PowerPoint (Client-side):', error);
      // Ensure the alert message is correct
      alert(`Error converting PDF to PowerPoint: ${error.message}. (Note: This conversion is image-based and does not preserve editable text or layout.)`);
    } finally {
      setIsConverting(false); 
    }
  };


  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setPptxFileUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  }, [clearPickedCloudFiles]);


  return (
    <PdfToolUploader
      title="PDF to PowerPoint"
      subtitle="Convert your PDF files into a PowerPoint presentation using client-side processing (image-based slides)."
      
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
        allFiles.length === 1 && ( 
          <div className="flex flex-col items-center justify-center gap-4 mt-6 w-full p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Convert PDF to PowerPoint</h3>
            
            <button
                onClick={handlePdfToPpt}
                className="bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 flex-grow sm:flex-grow-0"
                disabled={allFiles.length === 0 || isConverting}
            >
                {isConverting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    Convert to PPTX <FaFilePowerpoint />
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
      toolSpecificContent={
        pptxFileUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl sm:text-2xl text-green-700 mb-3">✅ Your PDF has been converted to PowerPoint!</h2>
            <p className="text-sm text-gray-700 mb-4">
              (Note: This conversion is image-based. Each slide will be an image of a PDF page, not editable text or shapes.)
            </p>
            <a
              href={pptxFileUrl}
              download="converted_presentation.pptx"
              className="inline-block bg-red-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
            >
              ⬇ Download PowerPoint File <FaFilePowerpoint />
            </a>
          </div>
        )
      }
    />
  );
}