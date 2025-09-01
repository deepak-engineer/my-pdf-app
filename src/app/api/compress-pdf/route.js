// src/app/api/compress-pdf/route.js
import { PDFDocument } from 'pdf-lib';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this API route is dynamic and not cached

export async function POST(req) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdfFile');

    if (!pdfFile) {
      return NextResponse.json(
        { error: 'Missing PDF file for compression' },
        { status: 400 }
      );
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const existingPdfBytes = Buffer.from(arrayBuffer);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // --- PDF Compression/Optimization Logic using pdf-lib ---
    // pdf-lib directly images ko re-encode ya downscale nahi karta.
    // Lekin, save() method mein kuch options hain jo file size optimize kar sakte hain.
    // 'useObjectStreams' और 'isObjectStream' (अगर पीडीएफ लिब के version में supported हैं)
    // कुछ हद तक optimization provide करते हैं by removing unused objects, merging duplicate objects, etc.
    // For more advanced image compression, you'd need a different library or server-side tool.
    
    // Save with optimization options
    const modifiedPdfBytes = await pdfDoc.save({
      useObjectStreams: true, // Enable object streams for potentially smaller output
      // For more aggressive compression (like image downsampling), pdf-lib doesn't have direct methods.
      // You might need to extract images, compress them, and re-embed. That's complex.
    });

    // Optionally, get original and new size to show compression percentage
    const originalSize = existingPdfBytes.byteLength;
    const compressedSize = modifiedPdfBytes.byteLength;
    const compressionRatio = (1 - (compressedSize / originalSize)) * 100;
    console.log(`Original size: ${originalSize} bytes`);
    console.log(`Compressed size: ${compressedSize} bytes`);
    console.log(`Compression: ${compressionRatio.toFixed(2)}%`);


    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="compressed.pdf"`);
    // Optionally, send compression ratio back as a header or in response body if not direct download
    headers.set('X-Compression-Ratio', compressionRatio.toFixed(2));


    return new NextResponse(modifiedPdfBytes, { headers });

  } catch (error) {
    console.error('Error in /api/compress-pdf:', error);
    return NextResponse.json(
      { error: 'Failed to compress PDF' },
      { status: 500 }
    );
  }
}