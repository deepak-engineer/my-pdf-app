// src/app/split-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import dynamic from "next/dynamic";
import { FaFilePdf, FaTimes } from "react-icons/fa";

// Import your custom hook
import { useCloudPickers } from '@/hooks/useCloudPickers';
// Import the new useLocalStorage hook
import { useLocalStorage } from '@/hooks/useLocalStorage'; // <-- Naya import

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';

// Dynamically import react-pdf components (for toolSpecificContent previews)
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
  const [splitPdfUrls, setSplitPdfUrls] = useState([]);
  const [numPagesInPdf, setNumPagesInPdf] = useState(0);
  
  // --- USE NEW LOCALSTORAGE HOOK ---
  const [pagesToSplit, setPagesToSplit] = useLocalStorage('splitPdfPagesToSplit', ""); // <-- useLocalStorage hook use kiya
  // --- END NEW LOCALSTORAGE HOOK ---
  
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

  // --- PDF.JS WORKER CONFIG (Should run only once on client-side) ---
  useEffect(() => {
    const configurePdfJs = async () => {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `/pdf/pdf.worker.min.js`;
    };
    configurePdfJs();
  }, []);
  // --- END OF PDF.JS WORKER CONFIG ---


  // --- MODIFIED useEffect for managing splitPdfUrls and clearPickedCloudFiles ---
  useEffect(() => {
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      if (splitPdfUrls.length > 0) {
        setSplitPdfUrls([]);
      }
      
      setNumPagesInPdf(0);
      // pagesToSplit ko ab useLocalStorage hook manage karega, yahan clear karne ki zaroorat nahi.
      // setPagesToSplit(""); 

      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, splitPdfUrls, clearPickedCloudFiles]);

  // pagesToSplit ko localStorage mein save karne wala useEffect ab useLocalStorage hook ke andar hai,
  // isliye yahan ab iski zaroorat nahi.
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('splitPdfPagesToSplit', pagesToSplit);
  //   }
  // }, [pagesToSplit]);


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
        // setPagesToSplit(""); // Don't clear from here
      }
    };
    loadPdfInfo();
  }, [allFiles]);


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setSplitPdfUrls([]);
    setNumPagesInPdf(0);
    // setPagesToSplit(""); // Don't clear from here
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
    setSplitPdfUrls([]);

    try {
      const arrayBuffer = await inputPdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numPages = pdfDoc.getPageCount();

      const pagesToExtractGroups = parsePageRanges(pagesToSplit, numPages);

      if (pagesToExtractGroups.length === 0) {
          alert("No valid pages specified for splitting or invalid page range.");
          return;
      }
      
      const newSplitPdfUrls = [];

      for (const pageNumbers of pagesToExtractGroups) {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers.map(p => p - 1));

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
    contiguousPageGroups.push(currentGroup);

    return contiguousPageGroups;
  };


  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setSplitPdfUrls([]);
    setPagesToSplit(""); // Still clear here to explicitly reset the input field and localStorage
    setNumPagesInPdf(0);
  }, [clearPickedCloudFiles, setPagesToSplit]); // setPagesToSplit added to dependency array

  return (
    <PdfToolUploader
      title="Split PDF"
      subtitle="Separate one page or a whole set for easy conversion into independent PDF files."
      
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
        allFiles.length === 1 && numPagesInPdf > 0 && (
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
      toolSpecificContent={
        splitPdfUrls.length > 0 && (
          <div className="mt-8 p-4 border rounded-lg bg-yellow-50 shadow-inner">
            <h2 className="font-bold text-xl text-yellow-700 mb-3">✅ Your PDF has been split!</h2>
            <div className="flex flex-wrap justify-center gap-6">
                {splitPdfUrls.map((splitFile, idx) => (
                    <div key={idx} className="border p-3 rounded-lg shadow-sm flex flex-col items-center bg-white">
                        <p className="text-gray-800 font-semibold mb-2">Range {idx + 1}</p>
                        <div className="flex items-center justify-center gap-2 mb-2 w-full">
                            {allFiles[0] && Document && Page && (
                                <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                    <Document 
                                      file={allFiles[0]} 
                                      className="w-full h-full"
                                      loading={<span className="text-sm text-gray-500">Loading...</span>}
                                      error={<span className="text-sm text-red-500 text-center p-1">Failed to load PDF</span>}
                                    >
                                        <Page pageNumber={splitFile.pages[0]} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                </div>
                            )}

                            {splitFile.pages.length > 2 && <span className="text-xl font-bold text-gray-500 mx-1">...</span>}

                            {splitFile.pages.length > 1 && allFiles[0] && Document && Page && (
                                <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                    <Document 
                                      file={allFiles[0]} 
                                      className="w-full h-full"
                                      loading={<span className="text-sm text-gray-500">Loading...</span>}
                                      error={<span className="text-sm text-red-500 text-center p-1">Failed to load PDF</span>}
                                    >
                                        <Page pageNumber={splitFile.pages[splitFile.pages.length - 1]} width={100} renderTextLayer={false} renderAnnotationLayer={false} />
                                    </Document>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
                          {allFiles[0] && Document && Page && (
                            <>
                              <span>{splitFile.pages[0]}</span>
                              {splitFile.pages.length > 1 && splitFile.pages.length <= 2 ? (
                                <span>- {splitFile.pages[splitFile.pages.length - 1]}</span>
                              ) : splitFile.pages.length > 2 ? (
                                <>
                                  <span>...</span>
                                  <span>{splitFile.pages[splitFile.pages.length - 1]}</span>
                                </>
                              ) : null}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 text-center truncate w-full mb-2 mt-2">{splitFile.name}</p>
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