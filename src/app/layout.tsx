"use client";

import { SessionProvider } from "next-auth/react";
import NavBar from "@/components/NavBar";
import "./globals.css";
import { ToastContainer } from "react-toastify";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <ToastContainer />
        <SessionProvider>
          <NavBar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
