// src/app/api/ppt-to-pdf-server/route.js
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

// Helper to save buffer to a temporary file
async function saveTempFile(buffer, extension) {
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

// Helper to delete a file
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(`Could not delete temporary file: ${filePath}, Error: ${error.message}`);
  }
}

export async function POST(req) {
  let browser;
  let pptxFilePath;
  try {
    const formData = await req.formData();
    const pptxFile = formData.get('pptxFile');

    if (!pptxFile) {
      return NextResponse.json(
        { error: 'Missing PPTX file for conversion' },
        { status: 400 }
      );
    }

    const arrayBuffer = await pptxFile.arrayBuffer();
    const pptxBuffer = Buffer.from(arrayBuffer);

    // Save PPTX to a temporary file (Puppeteer ko access ke liye)
    pptxFilePath = await saveTempFile(pptxBuffer, 'pptx');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // executablePath: process.env.CHROMIUM_PATH || undefined, // For Vercel/custom environments
    });
    const page = await browser.newPage();

    // --- IMPORTANT: PPTX Rendering Strategy ---
    // Browser natively PPTX render nahi karta. 'data URL' se bhi download prompt aata hai.
    // For a functional demo without complex setup, we will use a simple HTML page that
    // instructs the user, as the actual PPTX content cannot be displayed and printed directly.
    // This is a known limitation for free PPTX-to-PDF via Puppeteer without a dedicated viewer.
    
    // To see content, you'd need:
    // A) Publicly host the PPTX (e.g., S3), then navigate to Google Docs Viewer URL:
    //    const publicPptxUrl = 'https://your-domain.com/temp/your_file.pptx'; // Requires upload logic
    //    await page.goto(`https://docs.google.com/gview?url=${encodeURIComponent(publicPptxUrl)}&embedded=true`, { waitUntil: 'networkidle0' });
    //    await page.waitForSelector('iframe'); // Wait for viewer iframe to load
    //    // Then find the iframe and print its content
    // B) Use a client-side PPTX-to-HTML converter in Puppeteer (very complex).

    // For this demonstration, we are printing a placeholder page.
    // The resulting PDF will NOT contain the PPTX content.
    await page.setContent(`
      <html>
        <head><title>PPTX Conversion Result</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>PPTX to PDF Conversion</h1>
          <p>This conversion method uses a headless browser.</p>
          <p><strong>Note:</strong> Direct rendering of PPTX content in a headless browser is complex and typically requires:</p>
          <ul>
            <li>A publicly accessible URL for your PPTX file, OR</li>
            <li>Integration with an online viewer (e.g., Google Docs Viewer) with that public URL, OR</li>
            <li>A server-side PPTX to HTML converter.</li>
          </ul>
          <p>The generated PDF below is a placeholder. For actual content, please implement a robust PPTX viewing strategy.</p>
          <p>File processed: <strong>${pptxFile.name}</strong></p>
        </body>
      </html>
    `, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="converted_presentation.pdf"',
      },
    });

  } catch (error) {
    console.error('Error in /api/ppt-to-pdf-server:', error);
    return NextResponse.json(
      { error: `Failed to convert PPTX to PDF: ${error.message}. (Hint: PPTX rendering in headless browser is complex without external viewers or public URLs.)` },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    if (pptxFilePath) {
      await deleteFile(pptxFilePath); // Delete temporary PPTX file
    }
  }
}