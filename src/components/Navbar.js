"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-gray-900 px-6 py-4 flex justify-between items-center relative">
      <h1 className="text-red-500 font-bold text-xl">I ❤️ PDF</h1>
      <div className="flex gap-6 items-center">
        <Link href="/merge-pdf">Merge PDF</Link>
        <Link href="/split-pdf">Split PDF</Link>
        <Link href="/compress-pdf">Compress PDF</Link>
        <Link href="/pdf-to-word">Convert</Link>

        {/* All Tools Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button className="hover:text-red-400">All PDF Tools ▾</button>
          {showDropdown && (
            <div className="absolute top-10 right-0 bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-3 gap-10 z-50">
              {/* Organize PDF */}
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Organize PDF</h3>
                <ul className="space-y-1 text-sm">
                  <li><Link href="/merge-pdf">Merge PDF</Link></li>
                  <li><Link href="/split-pdf">Split PDF</Link></li>
                  <li><Link href="/organize-pdf">Organize PDF</Link></li>
                </ul>
              </div>

              {/* Optimize PDF */}
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Optimize PDF</h3>
                <ul className="space-y-1 text-sm">
                  <li><Link href="/compress-pdf">Compress PDF</Link></li>
                </ul>
              </div>

              {/* Convert PDF */}
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Convert PDF</h3>
                <ul className="space-y-1 text-sm">
                  <li><Link href="/pdf-to-word">PDF ⇄ Word</Link></li>
                  <li><Link href="/pdf-to-excel">PDF ⇄ Excel</Link></li>
                  <li><Link href="/pdf-to-ppt">PDF ⇄ PowerPoint</Link></li>
                  <li><Link href="/pdf-to-jpg">PDF ⇄ JPG</Link></li>
                </ul>
              </div>

              {/* Edit PDF */}
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Edit PDF</h3>
                <ul className="space-y-1 text-sm">
                  <li><Link href="/edit-pdf">Edit PDF</Link></li>
                  <li><Link href="/crop-pdf">Crop PDF</Link></li>
                  <li><Link href="/page-numbers">Page Numbers</Link></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
