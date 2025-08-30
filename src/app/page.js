// src/app/page.js
import ToolCard from "@/components/ToolCard";
import {
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileImage,
  FaEdit,
  FaCompress,
  FaCrop,
  FaSortNumericDown,
} from "react-icons/fa";

export default function HomePage() {
  const tools = [
    {
      title: "Merge PDF",
      description: "Combine PDFs in the order you want with the easiest PDF merger available.",
      link: "/merge-pdf",
      icon: <FaFilePdf />,
      iconBg: "bg-red-600"
    },
    {
      title: "Split PDF",
      description: "Separate one page or a whole set for easy conversion into independent PDF files.",
      link: "/split-pdf",
      icon: <FaFilePdf />,
      iconBg: "bg-orange-600"
    },
    {
      title: "Compress PDF",
      description: "Reduce file size while optimizing for maximal PDF quality.",
      link: "/compress-pdf",
      icon: <FaCompress />,
      iconBg: "bg-green-600"
    },
    {
      title: "PDF ⇄ Word",
      description: "Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.",
      link: "/pdf-to-word",
      icon: <FaFileWord />,
      iconBg: "bg-blue-600"
    },
    {
      title: "Word ⇄ PDF",
      description: "Make DOC and DOCX files easy to read by converting them to PDF.",
      link: "/word-to-pdf",
      icon: <FaFileWord />,
      iconBg: "bg-blue-600"
    },
    {
      title: "PDF ⇄ PowerPoint",
      description: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
      link: "/pdf-to-ppt",
      icon: <FaFilePowerpoint />,
      iconBg: "bg-orange-500"
    },
    {
      title: "Powerpoint ⇄ PDF",
      description: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
      link: "/ppt-to-pdf",
      icon: <FaFilePowerpoint />,
      iconBg: "bg-orange-500"
    },
    {
      title: "PDF ⇄ Excel",
      description: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
      link: "/pdf-to-excel",
      icon: <FaFileExcel />,
      iconBg: "bg-green-500"
    },
    {
      title: "Excel ⇄ PDF",
      description: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
      link: "/pdf-to-excel", // NOTE: This was same as PDF to Excel, might be a typo. Changed to a unique link for Excel to PDF tool.
      icon: <FaFileExcel />,
      iconBg: "bg-green-500"
    },
    {
      title: "Edit PDF",
      description: "Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.",
      link: "/edit-pdf",
      icon: <FaEdit />,
      iconBg: "bg-pink-600"
    },
    {
      title: "PDF ⇄ JPG",
      description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
      link: "/pdf-to-jpg",
      icon: <FaFileImage />,
      iconBg: "bg-yellow-600"
    },
    {
      title: "JPG to PDF",
      description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
      link: "/jpg-to-pdf",
      icon: <FaFileImage />,
      iconBg: "bg-yellow-500"
    },
    {
      title: "Crop PDF",
      description: "Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.",
      link: "/crop-pdf",
      icon: <FaCrop />,
      iconBg: "bg-purple-600"
    },
    {
      title: "Page Numbers",
      description: "• Select position, font, size, color\n• Skip numbering on selected pages",
      link: "/page-numbers",
      icon: <FaSortNumericDown />,
      iconBg: "bg-gray-700"
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center p-4 sm:p-6"> {/* Main container */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 w-full"> {/* Inner container for content */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 sm:mb-12">All PDF Tools</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.link || index} {...tool} />
          ))}
        </div>
      </div>
    </div>
  );
}