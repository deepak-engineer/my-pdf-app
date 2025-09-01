"use client";
// src/components/PdfEditorKonva.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
// import * as pdfjsLib from 'pdfjs-dist'; // REMOVE THIS DIRECT IMPORT
import { FaTextHeight, FaImage, FaSave, FaSpinner, FaTrashAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Global variable to hold pdfjsLib after dynamic import
let pdfjsLibGlobal = null; 

// Global flag for pdfjs worker initialization
let isPdfjsWorkerGloballyInitialized = false; 

// Dynamic imports for react-konva components
const KonvaComponents = dynamic(
  () => import('react-konva').then(mod => ({
    Stage: mod.Stage,
    Layer: mod.Layer,
    Image: mod.Image,
    Text: mod.Text,
  })),
  { ssr: false }
);

const KonvaCore = dynamic(
  () => import('konva').then(mod => mod.default),
  { ssr: false }
);


const PdfEditorKonva = ({ file, onSave }) => {
  const containerRef = useRef(null);
  const imageLayerRef = useRef(null);
  const editorLayerRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTool, setCurrentTool] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [konvaItems, setKonvaItems] = useState([]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [pdfImage, setPdfImage] = useState(null);

  const textInputAreaRef = useRef(null);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [textEditValue, setTextEditValue] = useState('');
  const [activeTextNode, setActiveTextNode] = useState(null);
  
  const [isKonvaLoaded, setIsKonvaLoaded] = useState(false);
  const [isPdfjsLibLoaded, setIsPdfjsLibLoaded] = useState(false);

  // --- PDF.js Lib and Worker Initialization (Client-side only) ---
  useEffect(() => {
    const initializePdfjsAndWorker = async () => {
      if (typeof window !== 'undefined' && !isPdfjsLibLoaded) {
        try {
          const pdfjs = await import('pdfjs-dist');
          pdfjsLibGlobal = pdfjs;
          
          if (!isPdfjsWorkerGloballyInitialized) { 
            pdfjs.GlobalWorkerOptions.workerSrc = `/pdf/pdf.worker.min.js`;
            isPdfjsWorkerGloballyInitialized = true;
          }
          
          setIsPdfjsLibLoaded(true);
          console.log("PDF.js library and worker configured successfully.");
        } catch (err) {
          console.error("Failed to load PDF.js library or configure worker:", err);
          setError(`Failed to load PDF viewer components: ${err.message}`);
          setIsPdfjsLibLoaded(false);
        }
      }
    };

    initializePdfjsAndWorker();
  }, [isPdfjsLibLoaded]);


  // --- PDF Rendering and Konva.js Initialization ---
  useEffect(() => {
    const renderPdfAndInitKonva = async () => {
      if (!file || !containerRef.current || !isKonvaLoaded || !isPdfjsLibLoaded || !pdfjsLibGlobal) { 
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setKonvaItems([]);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLibGlobal.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);

        const page = await pdf.getPage(currentPageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const offscreenCanvas = document.createElement('canvas');
        const offscreenContext = offscreenCanvas.getContext('2d');
        offscreenCanvas.height = viewport.height;
        offscreenCanvas.width = viewport.width;

        const renderContext = {
          canvasContext: offscreenContext,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        const image = new window.Image();
        image.src = offscreenCanvas.toDataURL();
        await new Promise(resolve => { image.onload = resolve; });
        
        setPdfImage(image);
        setPageWidth(viewport.width);
        setPageHeight(viewport.height);

        setIsLoading(false);
        
        return () => {
          if (pdfDoc) {
            pdfDoc.destroy();
            setPdfDoc(null);
          }
        };

      } catch (err) {
        console.error('PDF.js / Konva.js loading error:', err);
        setError(`Failed to load PDF or initialize editor: ${err.message}`);
        setIsLoading(false);
      }
    };

    if (KonvaComponents && KonvaCore) { 
        setIsKonvaLoaded(true);
        renderPdfAndInitKonva();
    } else {
        setIsKonvaLoaded(false);
    }
  }, [file, currentPageNum, KonvaComponents, KonvaCore, containerRef, isPdfjsLibLoaded, pdfjsLibGlobal]);


  const handleStageClick = (e) => {
    if (!KonvaCore || !isKonvaLoaded) return;

    if (e.target === e.target.getStage()) {
      if (currentTool === 'text' && textInput.trim()) {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();

        setKonvaItems((prevItems) => [
          ...prevItems,
          {
            id: KonvaCore.Util.getRandomIDS(),
            type: 'text',
            x: (pointer.x - stagePos.x) / stageScale,
            y: (pointer.y - stagePos.y) / stageScale,
            text: textInput,
            fontSize: 24 / stageScale,
            fill: '#000000',
            draggable: true,
          },
        ]);
        setTextInput('');
        setCurrentTool(null);
      }
      setCurrentTool(null);
    }
  };

  const handleTextDblClick = (e) => {
    if (!KonvaCore || !isKonvaLoaded) return;

    const textNode = e.target;
    if (!(textNode instanceof KonvaCore.Text)) {
      console.warn("DblClick event target is not a Konva.Text node.");
      return;
    }

    setActiveTextNode(textNode);
    setIsTextEditing(true);
    setTextEditValue(textNode.text());

    const textPosition = textNode.absolutePosition();
    const stage = textNode.getStage();
    const stageBox = stage.container().getBoundingClientRect();

    const area = textInputAreaRef.current;
    if (!area) return;

    area.style.display = 'block';
    area.style.top = stageBox.top + textPosition.y * stageScale + 'px';
    area.style.left = stageBox.left + textPosition.x * stageScale + 'px';
    area.style.width = textNode.width() * textNode.scaleX() * stageScale + 'px';
    area.style.height = textNode.height() * textNode.scaleY() * stageScale + 'px';
    area.style.fontSize = textNode.fontSize() * stageScale + 'px';
    area.style.border = '1px solid #ccc';
    area.style.padding = '0px';
    area.style.margin = '0px';
    area.style.overflow = 'hidden';
    area.style.background = 'white';
    area.style.position = 'absolute';
    area.style.outline = 'none';
    area.style.resize = 'none';
    area.style.lineHeight = textNode.lineHeight();
    area.style.fontFamily = textNode.fontFamily();
    area.style.transformOrigin = 'left top';
    area.style.textAlign = textNode.align();
    area.style.color = textNode.fill();
    area.focus();
  };

  const handleTextareaChange = (e) => {
    setTextEditValue(e.target.value);
    if (activeTextNode && imageLayerRef.current) {
      activeTextNode.text(e.target.value);
      imageLayerRef.current.batchDraw();
    }
  };

  const handleTextareaBlur = () => {
    setIsTextEditing(false);
    if (textInputAreaRef.current) {
        textInputAreaRef.current.style.display = 'none';
    }
    
    if (activeTextNode) {
      setKonvaItems((prevItems) =>
        prevItems.map((item) =>
          item.id === activeTextNode.id() ? { ...item, text: textEditValue } : item
        )
      );
      setActiveTextNode(null);
    }
  };


  const activateTextTool = useCallback(() => {
    setCurrentTool('text');
    setTextInput('New Text');
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file && editorLayerRef.current && KonvaCore && isKonvaLoaded) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          setKonvaItems((prevItems) => [
            ...prevItems,
            {
              id: KonvaCore.Util.getRandomIDS(),
              type: 'image',
              x: 100,
              y: 100,
              image: img,
              width: img.width * 0.2,
              height: img.height * 0.2,
              draggable: true,
            },
          ]);
        };
      };
      reader.readAsDataURL(file);
      setSelectedImageFile(null);
      setCurrentTool(null);
    }
  }, [KonvaCore, isKonvaLoaded]);


  const handleDeleteSelected = useCallback(() => {
    if (!editorLayerRef.current || !KonvaCore || !isKonvaLoaded) return;
    const stage = editorLayerRef.current.getStage();
    
    const selectedNodes = stage.find('.konva-draggable');
    selectedNodes.forEach(node => {
      node.destroy();
    });
    setKonvaItems((prevItems) => prevItems.filter(item => !selectedNodes.some(node => node.id() === item.id())));
    stage.batchDraw();
  }, [KonvaCore, konvaItems, isKonvaLoaded]);


  const goToPreviousPage = useCallback(async () => {
    if (currentPageNum > 1 && pdfDoc && isPdfjsLibLoaded && isKonvaLoaded) {
      setCurrentPageNum(prev => prev - 1);
      setKonvaItems([]);
    }
  }, [currentPageNum, pdfDoc, isPdfjsLibLoaded, isKonvaLoaded]);

  const goToNextPage = useCallback(async () => {
    if (currentPageNum < numPages && pdfDoc && isPdfjsLibLoaded && isKonvaLoaded) {
      setCurrentPageNum(prev => prev + 1);
      setKonvaItems([]);
    }
  }, [currentPageNum, numPages, pdfDoc, isPdfjsLibLoaded, isKonvaLoaded]);


  const saveEditedPdf = async () => {
    if (!imageLayerRef.current || !editorLayerRef.current || !file || !onSave || !KonvaCore || !isKonvaLoaded || !isPdfjsLibLoaded || !pdfjsLibGlobal) return;

    setIsSaving(true);
    setError(null);

    try {
      const stage = imageLayerRef.current.getStage();
      
      const konvaObjectsData = konvaItems.map(item => {
        const node = editorLayerRef.current.findOne('#' + item.id);
        if (!node) return null;

        const absolutePosition = node.absolutePosition();
        const scaledWidth = node.width() * node.scaleX();
        const scaledHeight = node.height() * node.scaleY();
        const rotation = node.rotation();

        return {
          id: item.id,
          type: item.type,
          x: absolutePosition.x,
          y: absolutePosition.y,
          width: scaledWidth,
          height: scaledHeight,
          rotation: rotation,
          text: item.type === 'text' ? node.text() : undefined,
          fontSize: item.type === 'text' ? node.fontSize() : undefined,
          fill: item.type === 'text' ? node.fill() : undefined,
          imageDataUrl: item.type === 'image' ? item.image.src : undefined, 
        };
      }).filter(Boolean);

      const originalPdfFile = file;

      const formData = new FormData();
      formData.append('pdfFile', originalPdfFile);
      formData.append('konvaObjectsData', JSON.stringify(konvaObjectsData));
      formData.append('pageNumber', currentPageNum.toString());

      const response = await fetch('/api/edit-pdf-konva', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit PDF on server.');
      }

      const blob = await response.blob();
      onSave(blob);

    } catch (err) {
      console.error('Save error:', err);
      setError(`Failed to save edited PDF: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  const handleWheel = (e) => {
    e.evt.preventDefault();
    if (!KonvaCore || !isKonvaLoaded) return;

    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 1.1 : oldScale / 1.1;

    if (newScale < 0.1 || newScale > 5) return;


    stage.scale({ x: newScale, y: newScale });

    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
    setStageScale(newScale);
    stage.batchDraw();
  };

  const handleDragEnd = (e) => {
    setStagePos(e.target.position());
  };


  return (
    <div className="w-full h-full flex flex-col items-center justify-start bg-gray-100 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-20">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          <p className="ml-3 text-lg text-gray-700">Loading editor...</p>
        </div>
      )}
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 z-30">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          <p className="ml-3 text-lg text-gray-700">Saving PDF...</p>
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md z-40">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="w-full bg-gray-800 text-white p-2 flex items-center justify-between gap-4 mb-2 z-10 rounded-t-lg">
        <div className="flex gap-2">
          <button
            onClick={activateTextTool}
            className={`p-2 rounded ${currentTool === 'text' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500`}
            title="Add Text"
            disabled={isLoading || !isKonvaLoaded || !isPdfjsLibLoaded}
          >
            <FaTextHeight size={20} />
          </button>
          <button
            onClick={() => setCurrentTool('image')}
            className={`p-2 rounded ${currentTool === 'image' ? 'bg-blue-600' : 'bg-gray-700'} hover:bg-blue-500`}
            title="Add Image"
            disabled={isLoading || !isKonvaLoaded || !isPdfjsLibLoaded}
          >
            <FaImage size={20} />
          </button>
          <button
            onClick={handleDeleteSelected}
            className={`p-2 rounded bg-red-700 hover:bg-red-600`}
            title="Delete Selected"
            disabled={isLoading || !isKonvaLoaded || konvaItems.length === 0 || !isPdfjsLibLoaded}
          >
            <FaTrashAlt size={20} />
          </button>
        </div>

        {/* Text Input for 'text' tool */}
        {currentTool === 'text' && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type text to add"
              className="p-1.5 text-sm rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // Text is added on stage click, not directly from here
                }
              }}
            />
          </div>
        )}

        {/* Image Input for 'image' tool */}
        {currentTool === 'image' && (
          <div className="flex items-center gap-2">
            <label className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-sm cursor-pointer" disabled={isLoading || !isKonvaLoaded || !isPdfjsLibLoaded}>
              Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        )}
        
        {/* Page navigation controls */}
        <div className="flex items-center gap-2">
          <button onClick={goToPreviousPage} disabled={isLoading || currentPageNum <= 1 || !isPdfjsLibLoaded} className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"> &lt; </button>
          <span className="text-sm">{currentPageNum} / {numPages}</span>
          <button onClick={goToNextPage} disabled={isLoading || currentPageNum >= numPages || !isPdfjsLibLoaded} className="p-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50"> &gt; </button>
        </div>

        {/* Save button (on the right) */}
        <button
          onClick={saveEditedPdf}
          className="p-2 rounded bg-green-600 hover:bg-green-700 flex items-center gap-1"
          title="Save Edited PDF"
          disabled={isLoading || isSaving || konvaItems.length === 0 || !isPdfjsLibLoaded}
        >
          <FaSave size={18} /> Save
        </button>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-grow w-full h-full overflow-hidden relative flex justify-center items-center" 
        onWheel={handleWheel}
      >
        {isKonvaLoaded && isPdfjsLibLoaded && ( // Only render Stage if Konva AND PDF.js are ready
            <KonvaStage
              width={pageWidth}
              height={pageHeight}
              scaleX={stageScale}
              scaleY={stageScale}
              x={stagePos.x}
              y={stagePos.y}
              draggable
              onDragEnd={handleDragEnd}
              onClick={handleStageClick}
              onTap={handleStageClick}
            >
              <KonvaLayer ref={imageLayerRef}>
                {pdfImage && (
                  <KonvaImage image={pdfImage} x={0} y={0} width={pageWidth} height={pageHeight} />
                )}
              </KonvaLayer>
              <KonvaLayer ref={editorLayerRef}>
                {konvaItems.map((item) => {
                  if (item.type === 'text') {
                    return (
                      <KonvaText
                        key={item.id}
                        id={item.id}
                        x={item.x}
                        y={item.y}
                        text={item.text}
                        fontSize={item.fontSize}
                        fill={item.fill}
                        draggable={item.draggable}
                        onDblClick={handleTextDblClick}
                        onDblTap={handleTextDblClick}
                        className="konva-draggable"
                      />
                    );
                  } else if (item.type === 'image') {
                    return (
                      <KonvaImage
                        key={item.id}
                        id={item.id}
                        x={item.x}
                        y={item.y}
                        image={item.image}
                        width={item.width}
                        height={item.height}
                        draggable={item.draggable}
                        className="konva-draggable"
                      />
                    );
                  }
                  return null;
                })}
              </KonvaLayer>
            </KonvaStage>
        )}
        {isTextEditing && (
            <textarea
              ref={textInputAreaRef}
              value={textEditValue}
              onChange={handleTextareaChange}
              onBlur={handleTextareaBlur}
              className="absolute top-0 left-0"
              style={{ display: 'none' }}
            />
          )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(PdfEditorKonva), { ssr: false });