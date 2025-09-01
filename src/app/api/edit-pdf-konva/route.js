// src/app/api/edit-pdf-konva/route.js
import { PDFDocument, rgb, StandardFonts, PNG, JPG } from 'pdf-lib';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this API route is dynamic and not cached

// Helper function to convert Data URL to ArrayBuffer
async function dataUrlToArrayBuffer(dataUrl) {
    const response = await fetch(dataUrl);
    return response.arrayBuffer();
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdfFile');
    const konvaObjectsDataJson = formData.get('konvaObjectsData');
    const pageNumberToEdit = parseInt(formData.get('pageNumber')) || 1; 

    if (!pdfFile || !konvaObjectsDataJson) {
      return NextResponse.json(
        { error: 'Missing PDF file or editor state' },
        { status: 400 }
      );
    }

    const existingPdfBytes = Buffer.from(await pdfFile.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    if (pageNumberToEdit < 1 || pageNumberToEdit > pages.length) {
        return NextResponse.json(
            { error: `Invalid page number specified: ${pageNumberToEdit}` },
            { status: 400 }
        );
    }
    const targetPage = pages[pageNumberToEdit - 1]; // Convert to 0-indexed for pdf-lib

    const konvaObjectsData = JSON.parse(konvaObjectsDataJson);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const obj of konvaObjectsData) {
        if (obj.type === 'text') {
            const text = obj.text;
            const fontSize = obj.fontSize;
            const x = obj.x;
            // Konva y is from top-left, pdf-lib y is from bottom-left
            // Adjust y coordinate for pdf-lib
            const y = targetPage.getHeight() - (obj.y + fontSize); 

            targetPage.drawText(text, {
                x,
                y,
                font,
                size: fontSize,
                color: rgb(0, 0, 0), // Default to black
                // Rotation handling is complex with pdf-lib for existing elements.
                // For simplicity, we are not directly applying Konva rotation here.
            });
        } else if (obj.type === 'image') {
            const imgDataUrl = obj.imageDataUrl;
            if (!imgDataUrl) {
                console.warn(`Image data URL missing for Konva item: ${obj.id}`);
                continue;
            }
            const imgBuffer = await dataUrlToArrayBuffer(imgDataUrl);
            
            let embeddedImage;
            if (imgDataUrl.startsWith('data:image/png')) {
                embeddedImage = await pdfDoc.embedPng(imgBuffer);
            } else if (imgDataUrl.startsWith('data:image/jpeg') || imgDataUrl.startsWith('data:image/jpg')) {
                embeddedImage = await pdfDoc.embedJpg(imgBuffer);
            } else {
                console.warn('Unsupported image format in Konva data:', imgDataUrl.substring(0, 30));
                continue;
            }

            const width = obj.width;
            const height = obj.height;
            const x = obj.x;
            const y = targetPage.getHeight() - (obj.y + height); 

            targetPage.drawImage(embeddedImage, {
                x,
                y,
                width,
                height,
                // rotate: degrees(obj.rotation), // rotation is complex
            });
        }
        // Add more object types (e.g., shapes) here if implemented in Konva.js
    }

    const modifiedPdfBytes = await pdfDoc.save();

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="edited_konva.pdf"');

    return new NextResponse(modifiedPdfBytes, { headers });

  } catch (error) {
    console.error('Error in /api/edit-pdf-konva:', error);
    return NextResponse.json(
      { error: `Failed to edit PDF on server: ${error.message}` },
      { status: 500 }
    );
  }
}