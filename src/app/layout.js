// src/app/layout.js
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "PDF Tools",
  description: "iLovePDF Clone built with Next.js App Router",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white" suppressHydrationWarning={true}> {/* <-- Yahan add kiya hai */}
        <Navbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}