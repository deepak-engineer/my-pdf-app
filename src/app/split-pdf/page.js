// src/app/split-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import dynamic from "next/dynamic"; // Iski ab yahan zaroorat nahi kyunki Document/Page PdfToolUploader mein dynamic hain.
import { FaFilePdf, FaTimes } from "react-icons/fa";

// Import your custom hook
import { useCloudPickers } from '@/hooks/useCloudPickers';

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';

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


export default function SplitPDF() {
  const [localFiles, setLocalFiles] = useState([]);
  const [splitPdfUrls, setSplitPdfUrls] = useState([]); // Array to hold URLs of split PDFs
  const [pagesToSplit, setPagesToSplit] = useState(""); // Input for page ranges (e.g., "1-3, 5, 8-10")
  const [numPagesInPdf, setNumPagesInPdf] = useState(0); // To store total pages of the uploaded PDF
  
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

  // Ref to track previous allFiles length to detect a change for clearing splitPdfUrls
  const prevAllFilesLengthRef = useRef(allFiles.length);

  // --- MODIFIED useEffect for managing splitPdfUrls and clearPickedCloudFiles ---
  useEffect(() => {
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      // Clear split PDFs if input files change
      if (splitPdfUrls.length > 0) {
        setSplitPdfUrls([]);
      }
      
      // Reset numPagesInPdf if files are cleared or changed
      setNumPagesInPdf(0);
      setPagesToSplit(""); // Also clear page input

      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, splitPdfUrls, clearPickedCloudFiles]);

  // Effect to get total pages of uploaded PDF
  useEffect(() => {
    const loadPdfInfo = async () => {
      if (allFiles.length === 1) {
        try {
          const arrayBuffer = await allFiles[0].arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          setNumPagesInPdf(pdfDoc.getPageCount());
        } catch (error) {
          console.error("Error loading PDF info:", error);
          setNumPagesInPdf(0);
        }
      } else {
        setNumPagesInPdf(0);
        setPagesToSplit(""); // Clear page input if no file or multiple files
      }
    };
    loadPdfInfo();
  }, [allFiles]); // Run when allFiles changes


  // --- File Handling Functions ---
  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    // Clear split PDFs when a file is removed
    setSplitPdfUrls([]);
    setNumPagesInPdf(0); // Reset page count
    setPagesToSplit(""); // Clear page input
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles]);

  const handleSplit = async () => {
    if (allFiles.length === 0) {
      alert("Please upload at least one PDF to split.");
      return;
    }
    if (allFiles.length > 1) {
      alert("Please select only one PDF file to split at a time.");
      return;
    }
    if (!pagesToSplit) {
        alert("Please specify pages to split.");
        return;
    }

    const inputPdfFile = allFiles[0];
    setSplitPdfUrls([]); // Clear previous split results

    try {
      const arrayBuffer = await inputPdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numPages = pdfDoc.getPageCount();

      // Parse page ranges (e.g., "1-3, 5, 8-10")
      const pagesToExtractGroups = parsePageRanges(pagesToSplit, numPages);

      if (pagesToExtractGroups.length === 0) {
          alert("No valid pages specified for splitting or invalid page range.");
          return;
      }
      
      const newSplitPdfUrls = [];

      for (const pageNumbers of pagesToExtractGroups) {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers.map(p => p - 1)); // Adjust to 0-indexed

        copiedPages.forEach((page) => newPdf.addPage(page));

        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        newSplitPdfUrls.push({ 
          name: `split_${inputPdfFile.name.replace('.pdf', '')}_pages_${pageNumbers.length === 1 ? pageNumbers[0] : `${pageNumbers[0]}-${pageNumbers[pageNumbers.length - 1]}`}.pdf`, 
          url,
          pages: pageNumbers // Store page numbers for preview
        });
      }

      setSplitPdfUrls(newSplitPdfUrls);

    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert(`Failed to split PDF: ${error.message}. Please check your file and page range.`);
    }
  };

  // Helper function to parse page ranges
  const parsePageRanges = (rangeString, totalPages) => {
    const pages = [];
    const parts = rangeString.split(',').map(part => part.trim()).filter(Boolean);

    for (const part of parts) {
        if (part.includes('-')) {
            let [start, end] = part.split('-').map(Number);
            if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
                console.warn(`Invalid page range part: ${part}`);
                continue;
            }
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
        } else {
            const pageNum = Number(part);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
                console.warn(`Invalid page number part: ${part}`);
                continue;
            }
            if (!pages.includes(pageNum)) pages.push(pageNum);
        }
    }
    // Sort and remove duplicates
    const sortedUniquePages = [...new Set(pages)].sort((a,b) => a - b);
    const contiguousPageGroups = [];
    if (sortedUniquePages.length === 0) return [];

    let currentGroup = [sortedUniquePages[0]];
    for (let i = 1; i < sortedUniquePages.length; i++) {
        if (sortedUniquePages[i] === currentGroup[currentGroup.length - 1] + 1) {
            currentGroup.push(sortedUniquePages[i]);
        } else {
            contiguousPageGroups.push(currentGroup);
            currentGroup = [sortedUniquePages[i]];
        }
    }
    contiguousPageGroups.push(currentGroup); // Add the last group

    return contiguousPageGroups;
  };


  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setSplitPdfUrls([]); // Clear split URLs as well
    setPagesToSplit(""); // Clear page input
    setNumPagesInPdf(0); // Reset page count
  }, [clearPickedCloudFiles]);

  return (
    <PdfToolUploader
      title="Split PDF"
      subtitle="Separate one page or a whole set for easy conversion into independent PDF files."
      
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
        allFiles.length === 1 && numPagesInPdf > 0 && ( // Only show action buttons if one PDF is uploaded and pages are known
          <>
            <div className="flex flex-col items-center gap-2">
              <label htmlFor="pagesToSplit" className="text-gray-700 font-medium">Pages to Split (e.g., 1-3, 5):</label>
              <input
                type="text"
                id="pagesToSplit"
                value={pagesToSplit}
                onChange={(e) => setPagesToSplit(e.target.value)}
                placeholder={`e.g., 1-${numPagesInPdf} or 1-3, 5`}
                className="p-2 border border-gray-300 rounded-md w-64 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSplit}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
            >
              Split PDF
            </button>
            <button
              onClick={clearAllFiles}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold shadow-md"
            >
              Clear All
            </button>
          </>
        )
      }
      // Tool-specific content (e.g., split PDF previews)
      toolSpecificContent={
        splitPdfUrls.length > 0 && (
          <div className="mt-8 p-4 border rounded-lg bg-yellow-50 shadow-inner">
            <h2 className="font-bold text-xl text-yellow-700 mb-3">✅ Your PDF has been split!</h2>
            <div className="flex flex-wrap justify-center gap-6"> {/* Changed to flex-wrap for better layout */}
                {splitPdfUrls.map((splitFile, idx) => (
                    <div key={idx} className="border p-3 rounded-lg shadow-sm flex flex-col items-center bg-white">
                        <p className="text-gray-800 font-semibold mb-2">Range {idx + 1}</p> {/* Range label */}
                        <div className="flex items-center gap-2 mb-2">
                            {/* Preview for the first page of the split range */}
                            {allFiles[0] && Document && Page && (
                                <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                    <Document file={allFiles[0]} className="w-full h-full">
                                        <Page pageNumber={splitFile.pages[0]} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                    <p className="text-xs text-gray-500 text-center mt-1">{splitFile.pages[0]}</p>
                                </div>
                            )}

                            {/* Ellipsis if more than two pages in range */}
                            {splitFile.pages.length > 2 && <span className="text-xl font-bold text-gray-500 mx-1">...</span>}

                            {/* Preview for the last page of the split range (if different from first) */}
                            {splitFile.pages.length > 1 && allFiles[0] && Document && Page && (
                                <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                    <Document file={allFiles[0]} className="w-full h-full">
                                        <Page pageNumber={splitFile.pages[splitFile.pages.length - 1]} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                    <p className="text-xs text-gray-500 text-center mt-1">{splitFile.pages[splitFile.pages.length - 1]}</p>
                                </div>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 text-center truncate w-full mb-2">{splitFile.name}</p>
                        <a
                            href={splitFile.url}
                            download={splitFile.name}
                            className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition text-sm"
                        >
                            ⬇ Download
                        </a>
                    </div>
                ))}
            </div>
          </div>
        )
      }
    />
  );
}