// src/components/ToolCard.js
import Link from "next/link";
import React from 'react'; // React import karna zaroori hai

export default function ToolCard({ title, description, link, icon, iconBg }) {
  return (
    <Link href={link} className="block"> {/* Ensure Link wraps the entire card and is a block element */}
      <div className="flex flex-col h-full bg-gray-800 hover:bg-gray-700 p-4 sm:p-5 rounded-xl shadow-lg cursor-pointer transition">
        
        {/* Top Section */}
        <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3"> {/* Smaller gap on small screens */}
          {/* Icon Box */}
          <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-md text-white text-base sm:text-lg flex-shrink-0 ${iconBg}`}> {/* Smaller icon on small screens */}
            {icon}
          </div>

          {/* Title */}
          <h2 className="text-sm sm:text-base font-semibold text-white leading-tight flex-grow"> {/* Smaller font on small screens */}
            {title}
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs sm:text-sm leading-snug whitespace-pre-line flex-grow"> {/* Smaller font on small screens */}
          {description}
        </p>
      </div>
    </Link>
  );
}