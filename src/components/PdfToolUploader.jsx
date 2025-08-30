// src/app/merge-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
// dynamic import of Document/Page NO LONGER NEEDED HERE
// import dynamic from "next/dynamic"; 

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';
import { useLocalStorage } from '@/hooks/useLocalStorage'; // Make sure this is imported

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';
// PdfPreviewThumbnail is now used inside PdfToolUploader

// Document and Page imports NO LONGER NEEDED HERE
// const Document = dynamic( /* ... */ );
// const Page = dynamic( /* ... */ );


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
      toolSpecificContent={
        mergedPdfUrl && (
          <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
            <h2 className="font-bold text-xl text-green-700 mb-3">✅ Merged PDF is ready!</h2>
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
}```

---

### **Step 4: `src/app/split-pdf/page.js` ko Update karte hain (Refactoring)**

`SplitPDF` component mein se bhi `Document` aur `Page` ka dynamic import hata denge aur `PdfToolUploader` ko `fileInputRef` prop pass karenge. Aur `toolSpecificContent` mein `PdfPreviewThumbnail` ka use karenge.

```jsx
// src/app/split-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
// dynamic import of Document/Page NO LONGER NEEDED HERE
// import dynamic from "next/dynamic"; 
import { FaFilePdf, FaTimes } from "react-icons/fa";

// Import your custom hooks
import { useCloudPickers } from '@/hooks/useCloudPickers';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Import the reusable component
import PdfToolUploader from '@/components/PdfToolUploader';
// Import PdfPreviewThumbnail for displaying previews in toolSpecificContent
import PdfPreviewThumbnail from '@/components/PdfPreviewThumbnail'; // <-- NEW IMPORT

// Document and Page imports NO LONGER NEEDED HERE
// const Document = dynamic( /* ... */ );
// const Page = dynamic( /* ... */ );


export default function SplitPDF() {
  const [localFiles, setLocalFiles] = useState([]);
  const [splitPdfUrls, setSplitPdfUrls] = useState([]);
  const [numPagesInPdf, setNumPagesInPdf] = useState(0);
  
  const [pagesToSplit, setPagesToSplit] = useLocalStorage('splitPdfPagesToSplit', ""); 
  
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

  // --- PDF.JS WORKER CONFIG ---
  // YE EFFECT BLOCK AB PdfPreviewThumbnail.js MEIN HAI, YAHAN ZAROORAT NAHI
  // useEffect(() => { /* ... */ }, []);


  useEffect(() => {
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      if (splitPdfUrls.length > 0) {
        setSplitPdfUrls([]);
      }
      
      setNumPagesInPdf(0);
      setPagesToSplit(""); 

      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, splitPdfUrls, clearPickedCloudFiles, setPagesToSplit]);


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
        setPagesToSplit(""); 
      }
    };
    loadPdfInfo();
  }, [allFiles, setPagesToSplit]);


  const removeFile = useCallback((indexToRemove) => {
    if (indexToRemove < localFiles.length) {
      setLocalFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    } else {
      const cloudFileIndex = indexToRemove - localFiles.length;
      setPickedCloudFiles(prevFiles => prevFiles.filter((_, index) => index !== cloudFileIndex));
    }
    setSplitPdfUrls([]);
    setNumPagesInPdf(0);
    setPagesToSplit(""); 
  }, [localFiles, pickedCloudFiles, setPickedCloudFiles, setPagesToSplit]);

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
    setPagesToSplit(""); 
    setNumPagesInPdf(0);
  }, [clearPickedCloudFiles, setPagesToSplit]);

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
                            {allFiles[0] && (
                                <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                    <PdfPreviewThumbnail file={allFiles[0]} pageNumber={splitFile.pages[0]} />
                                </div>
                            )}

                            {splitFile.pages.length > 2 && <span className="text-xl font-bold text-gray-500 mx-1">...</span>}

                            {splitFile.pages.length > 1 && allFiles[0] && (
                                <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                    <PdfPreviewThumbnail file={allFiles[0]} pageNumber={splitFile.pages[splitFile.pages.length - 1]} />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4 text-xs text-gray-500 mt-1">
                          {allFiles[0] && (
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