'use client'

import Link from "next/link";
import React from 'react'; // React import karna zaroori hai

export default function ToolCard({ title, description, link, icon, iconBg }) {
  return (
    <Link href={link} className="block w-full"> {/* Link abhi bhi block aur w-full hai */}
      {/* Ab is div ko bhi w-full de rahe hain */}
      <div className="flex flex-col h-full w-full bg-gray-800 hover:bg-gray-700 p-4 sm:p-5 rounded-xl shadow-lg cursor-pointer transition">
        
        {/* Top Section */}
        <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
          {/* Icon Box */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-white text-base sm:text-lg flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>

          {/* Title */}
          <h2 className="text-sm sm:text-base font-semibold text-white leading-tight flex-grow">
            {title}
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs sm:text-sm leading-snug whitespace-pre-line flex-grow">
          {description}
        </p>
      </div>
    </Link>
  );
}