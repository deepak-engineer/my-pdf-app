import Link from "next/link";

export default function ToolCard({ title, description, link, icon, iconBg }) {
  return (
    <Link href={link}>
      <div className="flex flex-col h-full bg-gray-800 hover:bg-gray-700 p-5 rounded-xl shadow-lg cursor-pointer transition">
        
        {/* Top Section */}
        <div className="flex items-start gap-4 mb-3">
          {/* Icon Box */}
          <div className={`w-10 h-10 flex items-center justify-center rounded-md text-white text-lg ${iconBg}`}>
            {icon}
          </div>

          {/* Title */}
          <h2 className="text-base font-semibold">{title}</h2>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-snug whitespace-pre-line flex-grow">
          {description}
        </p>
      </div>
    </Link>
  );
}
