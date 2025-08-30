// src/components/Navbar.js
"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react"; // Added useRef, useEffect
import {
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileImage,
    FaCompress,
    FaEdit,
    FaCrop,
    FaSortNumericDown,
    FaBars, // Hamburger icon
    FaTimes, // Close icon
    FaChevronDown, // Dropdown indicator
    FaChevronUp, // Dropdown indicator
} from "react-icons/fa";

export default function Navbar() {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(null); // State for mobile dropdowns
    const navRef = useRef(null); // Ref for closing mobile menu on outside click

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

    // Close mobile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
                setActiveMobileDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [navRef]);


    return (
        <nav ref={navRef} className="bg-gray-900 px-6 py-4 flex justify-between items-center relative text-white">
            {/* LEFT SIDE - Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
                <h1 className="text-red-500 font-bold text-xl cursor-pointer">I 🖤 PDF</h1>
            </Link>

            {/* Hamburger Icon for Mobile */}
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white text-2xl focus:outline-none">
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* MENUS - Desktop */}
            <div className="hidden md:flex gap-6 items-center">
                <Link href="/merge-pdf" className="hover:text-red-400">Merge PDF</Link>
                <Link href="/split-pdf" className="hover:text-red-400">Split PDF</Link>
                <Link href="/compress-pdf" className="hover:text-red-400">Compress PDF</Link>

                {/* Convert Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => setActiveDropdown("convert")}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className="hover:text-red-400 flex items-center gap-1">Convert PDF {activeDropdown === "convert" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />} </button>
                    {activeDropdown === "convert" && (
                        <div className="absolute top-full mt-2 left-0 bg-gray-800 p-4 rounded-lg shadow-lg space-y-2 z-50 w-56">
                            {menus.convert.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.link}
                                    className="flex items-center gap-3 text-sm text-gray-200 hover:text-red-400"
                                    onClick={() => setActiveDropdown(null)} // Close dropdown on item click
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
                    <button className="hover:text-red-400 flex items-center gap-1">All PDF Tools {activeDropdown === "allTools" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />} </button>
                    {activeDropdown === "allTools" && (
                        <div className="absolute top-full mt-2 left-0 bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-2 gap-6 z-50 w-[600px]">
                            {menus.allTools.map((section, i) => (
                                <div key={i}>
                                    <h3 className="text-gray-300 font-semibold mb-3">{section.category}</h3>
                                    <ul className="space-y-2 text-sm">
                                        {section.items.map((item, j) => (
                                            <li key={j}>
                                                <Link
                                                    href={item.link}
                                                    className="flex items-center gap-3 text-gray-200 hover:text-red-400"
                                                    onClick={() => setActiveDropdown(null)} // Close dropdown on item click
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

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-gray-900 shadow-lg pb-4 pt-2 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible h-auto' : 'opacity-0 invisible h-0 overflow-hidden'}`}>
                <div className="flex flex-col px-6 space-y-3">
                    <Link href="/merge-pdf" className="block py-2 hover:text-red-400" onClick={() => setIsMobileMenuOpen(false)}>Merge PDF</Link>
                    <Link href="/split-pdf" className="block py-2 hover:text-red-400" onClick={() => setIsMobileMenuOpen(false)}>Split PDF</Link>
                    <Link href="/compress-pdf" className="block py-2 hover:text-red-400" onClick={() => setIsMobileMenuOpen(false)}>Compress PDF</Link>

                    {/* Mobile Convert Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setActiveMobileDropdown(activeMobileDropdown === "convert" ? null : "convert")}
                            className="flex justify-between items-center w-full py-2 hover:text-red-400 focus:outline-none"
                        >
                            Convert PDF {activeMobileDropdown === "convert" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                        {activeMobileDropdown === "convert" && (
                            <div className="pl-4 space-y-2 pt-2 bg-gray-800 rounded-md mt-1">
                                {menus.convert.map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.link}
                                        className="flex items-center gap-3 text-sm text-gray-200 hover:text-red-400 py-1"
                                        onClick={() => setIsMobileMenuOpen(false)} // Close both menus on click
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile All Tools Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setActiveMobileDropdown(activeMobileDropdown === "allTools" ? null : "allTools")}
                            className="flex justify-between items-center w-full py-2 hover:text-red-400 focus:outline-none"
                        >
                            All PDF Tools {activeMobileDropdown === "allTools" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                        {activeMobileDropdown === "allTools" && (
                            <div className="pl-4 space-y-2 pt-2 bg-gray-800 rounded-md mt-1">
                                {menus.allTools.map((section, i) => (
                                    <div key={i} className="mb-3 last:mb-0">
                                        <h3 className="text-gray-300 font-semibold mb-2">{section.category}</h3>
                                        <ul className="space-y-1 text-sm">
                                            {section.items.map((item, j) => (
                                                <li key={j}>
                                                    <Link
                                                        href={item.link}
                                                        className="flex items-center gap-3 text-gray-200 hover:text-red-400 py-1"
                                                        onClick={() => setIsMobileMenuOpen(false)} // Close both menus on click
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
            </div>
        </nav>
    );
}