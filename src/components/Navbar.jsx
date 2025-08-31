// src/components/Navbar.js
"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
    const [activeDropdown, setActiveDropdown] = useState(null); // For desktop dropdowns (which one is currently visible)
    const [clickedDropdown, setClickedDropdown] = useState(null); // For desktop dropdowns (which one was clicked open)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile hamburger menu
    const [activeMobileDropdown, setActiveMobileDropdown] = useState(null); // For mobile dropdowns inside hamburger
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
                    { title: "Excel to PDF", link:'/excel-to-pdf', icon: <FaFileExcel className="text-green-500" /> },
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

    // Close all menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
                setActiveMobileDropdown(null);
                setActiveDropdown(null); // Close desktop dropdowns
                setClickedDropdown(null); // Reset clicked state for desktop dropdowns
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [navRef]);

    // Close mobile menu if window is resized to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint is 768px
                setIsMobileMenuOpen(false);
                setActiveMobileDropdown(null);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Desktop dropdowns: Open on hover if not clicked open
    const handleMouseEnter = (dropdownName) => {
        if (!clickedDropdown) { // Only open on hover if no dropdown is currently clicked open
            setActiveDropdown(dropdownName);
        }
    };

    // Desktop dropdowns: Close on mouse leave if not clicked open
    const handleMouseLeave = () => {
        if (!clickedDropdown) { // Only close on mouse leave if it wasn't opened by a click
            setActiveDropdown(null);
        }
    };

    // Desktop dropdowns: Toggle on click, and set/unset clicked state
    const toggleDesktopDropdown = (dropdownName) => {
        if (activeDropdown === dropdownName) {
            // If the same dropdown is clicked again, close it and reset clicked state
            setActiveDropdown(null);
            setClickedDropdown(null);
        } else {
            // Open a new dropdown and mark it as clicked
            setActiveDropdown(dropdownName);
            setClickedDropdown(dropdownName);
        }
    };


    return (
        <nav ref={navRef} className="bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center fixed top-0 w-full text-white z-50">
            {/* Hamburger Icon for Mobile */}
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white text-xl sm:text-2xl focus:outline-none p-1">
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* LEFT SIDE - Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 ml-4 md:ml-0">
                <h1 className="font-bold text-lg sm:text-xl cursor-pointer text-red-500">
                    I <span className="text-red-500">🖤</span> PDF
                </h1>
            </Link>

            {/* MENUS - Desktop */}
            <div className="hidden md:flex ml-6 gap-4 lg:gap-6 items-center">
                <Link href="/merge-pdf" className="hover:text-red-400 text-sm lg:text-base">Merge PDF</Link>
                <Link href="/split-pdf" className="hover:text-red-400 text-sm lg:text-base">Split PDF</Link>
                <Link href="/compress-pdf" className="hover:text-red-400 text-sm lg:text-base">Compress PDF</Link>

                {/* Convert Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter("convert")} // Hover open
                    onMouseLeave={handleMouseLeave} // Hover close if not clicked
                >
                    <button
                        onClick={() => toggleDesktopDropdown("convert")} // Click toggle
                        className="hover:text-red-400 flex items-center gap-1 text-sm lg:text-base focus:outline-none"
                    >
                        Convert PDF {activeDropdown === "convert" ? <FaChevronUp size={10} className="lg:text-xs" /> : <FaChevronDown size={10} className="lg:text-xs" />}
                    </button>
                    {activeDropdown === "convert" && (
                        <div className="absolute top-full mt-2 left-0 bg-gray-700 p-3 sm:p-4 rounded-lg shadow-lg space-y-1 sm:space-y-2 z-50 w-48 sm:w-56">
                            {menus.convert.map((item, i) => (
                                item.link ? (
                                    <Link
                                        key={i}
                                        href={item.link}
                                        className="flex items-center gap-2 sm:gap-3 text-gray-200 hover:text-red-400"
                                        // No onClick here for desktop dropdown items
                                    >
                                        <span className="text-base sm:text-lg">{item.icon}</span>
                                        {item.title}
                                    </Link>
                                ) : (
                                    <div key={i} className="flex items-center gap-2 sm:gap-3 text-gray-200">
                                        <span className="text-base sm:text-lg">{item.icon}</span>
                                        {item.title} (Link Missing)
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* All Tools Dropdown */}
                <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter("allTools")} // Hover open
                    onMouseLeave={handleMouseLeave} // Hover close if not clicked
                >
                    <button
                        onClick={() => toggleDesktopDropdown("allTools")} // Click toggle
                        className="hover:text-red-400 flex items-center gap-1 text-sm lg:text-base focus:outline-none"
                    >
                        All PDF Tools {activeDropdown === "allTools" ? <FaChevronUp size={10} className="lg:text-xs" /> : <FaChevronDown size={10} className="lg:text-xs" />}
                    </button>
                    {activeDropdown === "allTools" && (
                        <div className="absolute top-full mt-2 left-0 bg-gray-700 p-4 sm:p-6 rounded-lg shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 z-50 w-[300px] sm:w-[600px]">
                            {menus.allTools.map((section, i) => (
                                <div key={i}>
                                    <h3 className="text-gray-300 font-semibold text-sm sm:text-base mb-2 sm:mb-3">{section.category}</h3>
                                    <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                        {section.items.map((item, j) => (
                                            item.link ? (
                                                <li key={j}>
                                                    <Link
                                                        href={item.link}
                                                        className="flex items-center gap-2 sm:gap-3 text-gray-200 hover:text-red-400"
                                                        // No onClick here for desktop dropdown items
                                                    >
                                                        <span className="text-base sm:text-lg">{item.icon}</span>
                                                        {item.title}
                                                    </Link>
                                                </li>
                                            ) : (
                                                <li key={j} className="flex items-center gap-2 sm:gap-3 text-gray-200">
                                                    <span className="text-base sm:text-lg">{item.icon}</span>
                                                    {item.title} (Link Missing)
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu (Collapsible) - Yahan logic same rahegi */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-gray-800 shadow-lg pb-4 pt-2 transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 visible h-auto' : 'opacity-0 invisible h-0 overflow-hidden'}`}>
                <div className="flex flex-col px-4 sm:px-6 space-y-2 sm:space-y-3">
                    <Link href="/merge-pdf" className="block py-1.5 sm:py-2 hover:text-red-400 text-sm sm:text-base" onClick={() => setIsMobileMenuOpen(false)}>Merge PDF</Link>
                    <Link href="/split-pdf" className="block py-1.5 sm:py-2 hover:text-red-400 text-sm sm:text-base" onClick={() => setIsMobileMenuOpen(false)}>Split PDF</Link>
                    <Link href="/compress-pdf" className="block py-1.5 sm:py-2 hover:text-red-400 text-sm sm:text-base" onClick={() => setIsMobileMenuOpen(false)}>Compress PDF</Link>

                    {/* Mobile Convert Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setActiveMobileDropdown(activeMobileDropdown === "convert" ? null : "convert")}
                            className="flex justify-between items-center w-full py-1.5 sm:py-2 hover:text-red-400 focus:outline-none text-sm sm:text-base"
                        >
                            Convert PDF {activeMobileDropdown === "convert" ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </button>
                        {activeMobileDropdown === "convert" && (
                            <div className="pl-4 space-y-1 sm:space-y-2 pt-1.5 sm:pt-2 bg-gray-700 rounded-md mt-1">
                                {menus.convert.map((item, i) => (
                                    item.link ? (
                                        <Link
                                            key={i}
                                            href={item.link}
                                            className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-200 hover:text-red-400 py-1"
                                            onClick={() => setIsMobileMenuOpen(false)} // This closes the entire mobile menu on item click
                                        >
                                            <span className="text-base sm:text-lg">{item.icon}</span>
                                            {item.title}
                                        </Link>
                                    ) : (
                                        <div key={i} className="flex items-center gap-2 sm:gap-3 text-gray-200">
                                            <span className="text-base sm:text-lg">{item.icon}</span>
                                            {item.title} (Link Missing)
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile All Tools Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setActiveMobileDropdown(activeMobileDropdown === "allTools" ? null : "allTools")}
                            className="flex justify-between items-center w-full py-1.5 sm:py-2 hover:text-red-400 focus:outline-none text-sm sm:text-base"
                        >
                            All PDF Tools {activeMobileDropdown === "allTools" ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </button>
                        {activeMobileDropdown === "allTools" && (
                            <div className="pl-4 space-y-1 sm:space-y-2 pt-1.5 sm:pt-2 bg-gray-700 rounded-md mt-1">
                                {menus.allTools.map((section, i) => (
                                    <div key={i} className="mb-2 last:mb-0">
                                        <h3 className="text-gray-300 font-semibold text-sm sm:text-base mb-1 sm:mb-2">{section.category}</h3>
                                        <ul className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                                            {section.items.map((item, j) => (
                                                item.link ? (
                                                    <li key={j}>
                                                        <Link
                                                            href={item.link}
                                                            className="flex items-center gap-2 sm:gap-3 text-gray-200 hover:text-red-400"
                                                            onClick={() => setIsMobileMenuOpen(false)} // This closes the entire mobile menu on item click
                                                        >
                                                            <span className="text-base sm:text-lg">{item.icon}</span>
                                                            {item.title}
                                                        </Link>
                                                    </li>
                                                ) : (
                                                    <li key={j} className="flex items-center gap-2 sm:gap-3 text-gray-200">
                                                        <span className="text-base sm:text-lg">{item.icon}</span>
                                                        {item.title} (Link Missing)
                                                    </li>
                                                )
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