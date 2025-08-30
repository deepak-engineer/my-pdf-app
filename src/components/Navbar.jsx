"use client";
import Link from "next/link";
import { useState } from "react";
import {
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileImage,
    FaCompress,

    FaEdit,
    FaCrop,
    FaSortNumericDown,
} from "react-icons/fa";

export default function Navbar() {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const menus = {
        convert: [
            { title: "JPG to PDF", link: "/jpg-to-pdf", icon: <FaFileImage className="text-pink-400" /> },
            { title: "Word to PDF", link: "/word-to-pdf", icon: <FaFileWord className="text-blue-500" /> },
            { title: "PowerPoint to PDF", link: "/ppt-to-pdf", icon: <FaFilePowerpoint className="text-orange-500" /> },
            { title: "Excel to PDF", link: "/excel-to-pdf", icon: <FaFileExcel className="text-green-500" /> },

        ],
        allTools: [
            {
                category: "Organize PDF",
                items: [
                    { title: "Merge PDF", link: "/merge-pdf", icon: <FaFileImage className="text-red-400" /> },
                    { title: "Split PDF", link: "/split-pdf", icon: <FaFileImage className="text-yellow-400" /> },

                ],
            },
            {
                category: "Optimize PDF",
                items: [
                    { title: "Compress PDF", link: "/compress-pdf", icon: <FaCompress className="text-green-400" /> },
                ],
            },
            {
                category: "Convert to PDF",
                items: [
                    { title: "JPG to PDF", link: "/jpg-to-pdf", icon: <FaFileImage className="text-pink-400" /> },
                    { title: "Word to PDF", link: "/word-to-pdf", icon: <FaFileWord className="text-blue-500" /> },
                    { title: "PowerPoint to PDF", link: "/ppt-to-pdf", icon: <FaFilePowerpoint className="text-orange-500" /> },
                    { title: "Excel to PDF", link: "/excel-to-pdf", icon: <FaFileExcel className="text-green-500" /> },
                ],
            },
            {
                category: "Convert from PDF",
                items: [
                    { title: "PDF to JPG", link: "/pdf-to-jpg", icon: <FaFileImage className="text-pink-400" /> },
                    { title: "PDF to Word", link: "/pdf-to-word", icon: <FaFileWord className="text-blue-500" /> },
                    { title: "PDF to Excel", link: "/pdf-to-excel", icon: <FaFileExcel className="text-green-500" /> },
                    { title: "PDF to PowerPoint", link: "/pdf-to-ppt", icon: <FaFilePowerpoint className="text-orange-500" /> },
                ],
            },
            {
                category: "Edit PDF",
                items: [
                    { title: "Edit PDF", link: "/edit-pdf", icon: <FaEdit className="text-yellow-400" /> },
                    { title: "Crop PDF", link: "/crop-pdf", icon: <FaCrop className="text-purple-400" /> },
                    { title: "Page Numbers", link: "/page-numbers", icon: <FaSortNumericDown className="text-gray-300" /> },
                ],
            },
        ],
    };

    return (
        <nav className="bg-gray-900 px-6 py-4 flex justify-start items-center relative gap-8 text-white"> {/* Added text-white here for default text color */}
            {/* LEFT SIDE - Logo */}
            <Link href="/" className="flex items-center"> {/* <-- Yahan Link add kiya hai */}
                <h1 className="text-red-500 font-bold text-xl cursor-pointer">I 🖤 PDF</h1> {/* cursor-pointer add kiya hai for better UX */}
            </Link>


            {/* MENUS */}
            <div className="flex gap-6 items-center">
                <Link href="/merge-pdf">Merge PDF</Link>
                <Link href="/split-pdf">Split PDF</Link>
                <Link href="/compress-pdf">Compress PDF</Link>

                {/* Convert Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown("convert")}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className="hover:text-red-400">Convert PDF ▾</button>
                    {activeDropdown === "convert" && (
                        <div className="absolute top-10 left-0 bg-gray-800 p-4 rounded-lg shadow-lg space-y-2 z-50 w-56">
                            {menus.convert.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.link}
                                    className="flex items-center gap-3 text-sm text-gray-200 hover:text-red-400"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Tools Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown("allTools")}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className="hover:text-red-400">All PDF Tools ▾</button>
                    {activeDropdown === "allTools" && (
                        <div className="absolute top-10 left-0 bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-2 gap-6 z-50 w-[600px]">
                            {menus.allTools.map((section, i) => (
                                <div key={i}>
                                    <h3 className="text-gray-300 font-semibold mb-3">{section.category}</h3>
                                    <ul className="space-y-2 text-sm">
                                        {section.items.map((item, j) => (
                                            <li key={j}>
                                                <Link
                                                    href={item.link}
                                                    className="flex items-center gap-3 text-gray-200 hover:text-red-400"
                                                >
                                                    <span className="text-lg">{item.icon}</span>
                                                    {item.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}