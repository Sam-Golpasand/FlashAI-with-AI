import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FlashAI",
  description: "En digital løsning til din din læring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="be-vietnam dark ">
        <Navbar />
          {children}
        <ToastContainer />
      </body>
    </html>
  );
}