// src/components/PdfPreviewThumbnail.js
"use client";
import React, { useState, useEffect } from 'react'; // useState abhi bhi zaroori hai, lekin numPages ke liye nahi
import dynamic from "next/dynamic"; // Dynamic import karna zaroori hai
import { FaFilePdf } from "react-icons/fa";

// --- IMPORTANT CHANGES START HERE ---

// Dynamic import of Document and Page from 'react-pdf'
// This ensures they are only loaded client-side.
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);
const Page = dynamic(
  () => import("react-pdf").then((mod) => mod.Page),
  { ssr: false }
);

// Global flag to ensure worker is initialized only once across the app
let isPdfjsWorkerInitialized = false;

export default function PdfPreviewThumbnail({ file, pageNumber = 1 }) {
  // State to track if pdfjs and its worker are successfully loaded and configured
  const [hasPdfjsLoaded, setHasPdfjsLoaded] = useState(false);

  // --- Worker configuration inside useEffect ---
  useEffect(() => {
    const initializePdfjsWorker = async () => {
      // Ensure this runs only client-side and only once
      if (typeof window !== 'undefined' && !isPdfjsWorkerInitialized) {
        try {
          // Dynamically import 'react-pdf' to access pdfjs object
          const { pdfjs } = await import('react-pdf');
          
          // Set the workerSrc to the local file in the public folder
          pdfjs.GlobalWorkerOptions.workerSrc = `/pdf/pdf.worker.min.js`;
          
          isPdfjsWorkerInitialized = true; // Set flag
          setHasPdfjsLoaded(true); // Update state to indicate success
          console.log("PDF.js worker configured and library loaded successfully.");
        } catch (error) {
          console.error("Failed to configure PDF.js worker:", error);
          setHasPdfjsLoaded(false); // Update state to indicate failure
        }
      } else if (isPdfjsWorkerInitialized) {
        // If already initialized (e.g., component re-mounted), just update state
        setHasPdfjsLoaded(true);
      }
    };

    initializePdfjsWorker();
  }, []); // Empty dependency array means this runs once on component mount

  // --- End of IMPORTANT CHANGES ---


  // Conditional rendering based on worker setup, Document/Page load, and file validity
  if (!hasPdfjsLoaded || !Document || !Page || !file || file.type !== 'application/pdf') {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 flex-col gap-2 p-2 text-center">
            {/* Show loading spinner while PDF renderer is preparing */}
            {!hasPdfjsLoaded && (
              <span className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full mb-2"></span>
            )}
            <FaFilePdf className="text-red-400 text-4xl" />
            <span className="text-xs text-gray-500">
                {!hasPdfjsLoaded ? "Loading renderer..." : "Invalid PDF"}
            </span>
        </div>
    );
  }

  // If everything is loaded and configured, render the Document
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Document
        file={file}
        // Use a simple loading message, as pdfjs worker setup is handled separately
        loading={<span className="text-sm text-gray-500">Loading thumbnail...</span>}
        className="w-full h-full"
        // Provide an error component for react-pdf's internal errors
        error={<span className="text-sm text-red-500 text-center p-1">Failed to load PDF</span>}
        // onLoadSuccess is not needed here if numPages state is not used for display in this component
        // onLoadSuccess={onLoadSuccess}
      >
        <Page
          pageNumber={pageNumber}
          width={100} // Keep a fixed width for consistent thumbnail size
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}