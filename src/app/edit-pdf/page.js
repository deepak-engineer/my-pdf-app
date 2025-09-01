// src/app/edit-pdf/page.js
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// Import your custom hooks
import { useCloudPickers } from "@/hooks/useCloudPickers";

// Import the reusable component
import PdfToolUploader from "@/components/PdfToolUploader";
// Import the new Konva.js editor component
import PdfEditorKonva from "@/components/PdfEditorKonva";

export default function EditPDF() {
  const [localFiles, setLocalFiles] = useState([]);
  const [editedPdfBlob, setEditedPdfBlob] = useState(null);

  const fileInputRef = useRef(null);

  const {
    isPickerLoading,
    pickedCloudFiles,
    error: cloudPickerError,
    openGoogleDrivePicker,
    openDropboxChooser,
    clearPickedCloudFiles,
    setPickedCloudFiles,
  } = useCloudPickers();

  const allFiles = [...localFiles, ...pickedCloudFiles];
  const prevAllFilesLengthRef = useRef(allFiles.length);

  useEffect(() => {
    if (allFiles.length !== prevAllFilesLengthRef.current) {
      setEditedPdfBlob(null);
      if (prevAllFilesLengthRef.current > 0 && allFiles.length === 0) {
        clearPickedCloudFiles();
      }
    }
    prevAllFilesLengthRef.current = allFiles.length;
  }, [allFiles.length, clearPickedCloudFiles, setEditedPdfBlob]);

  const removeFile = useCallback(
    (indexToRemove) => {
      if (indexToRemove < localFiles.length) {
        setLocalFiles((prevFiles) =>
          prevFiles.filter((_, index) => index !== indexToRemove)
        );
      } else {
        const cloudFileIndex = indexToRemove - localFiles.length;
        setPickedCloudFiles((prevFiles) =>
          prevFiles.filter((_, index) => index !== cloudFileIndex)
        );
      }
      setEditedPdfBlob(null);
    },
    [localFiles, pickedCloudFiles, setPickedCloudFiles, setEditedPdfBlob]
  );

  const handlePdfSave = useCallback((blob) => {
    setEditedPdfBlob(blob);
  }, []);

  const clearAllFiles = useCallback(() => {
    setLocalFiles([]);
    clearPickedCloudFiles();
    setEditedPdfBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }, [clearPickedCloudFiles]);

  // ✅ Normalize file for PdfEditorKonva
  const normalizeFile = (file) => {
    if (!file) return null;

    if (file instanceof File || file instanceof Blob) {
      return file;
    }
    if (typeof file === "string") {
      return { url: file };
    }
    if (file?.link) {
      return { url: file.link };
    }
    if (file?.url) {
      return { url: file.url };
    }
    return null;
  };

  return (
    <PdfToolUploader
      title="Edit PDF"
      subtitle="Add text, images, and other elements interactively."
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
        allFiles.length === 1 &&
        editedPdfBlob && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={clearAllFiles}
              className="bg-gray-300 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold text-sm sm:text-base flex-shrink-0"
            >
              Clear All
            </button>
          </div>
        )
      }
      toolSpecificContent={
        <>
          {allFiles.length === 1 && !editedPdfBlob && (
            <div className="mt-8 p-0 w-full h-[80vh] flex">
              {/* Left Thumbnail Panel */}
              <div className="flex flex-col w-1/4 max-w-[200px] border-r border-gray-200 p-2 overflow-y-auto bg-white">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Pages</h3>
                <p className="text-xs text-gray-500">Page Thumbnails (Coming Soon)</p>
              </div>
              <div className="flex-grow">
                <PdfEditorKonva
                  file={normalizeFile(allFiles[0])}
                  onSave={handlePdfSave}
                />
              </div>
            </div>
          )}

          {editedPdfBlob && (
            <div className="mt-8 p-4 border rounded-lg bg-green-50 shadow-inner">
              <h2 className="font-bold text-xl sm:text-2xl text-green-700 mb-3">
                ✅ Your PDF has been edited!
              </h2>
              <iframe
                src={URL.createObjectURL(editedPdfBlob)}
                width="100%"
                height="300px"
                className="border rounded-lg shadow-md mb-4"
                title="Edited PDF Preview"
              ></iframe>
              <a
                href={URL.createObjectURL(editedPdfBlob)}
                download="edited_konva.pdf"
                className="inline-block bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold shadow-md text-sm sm:text-base"
              >
                ⬇ Download Edited PDF
              </a>
            </div>
          )}
        </>
      }
    />
  );
}
