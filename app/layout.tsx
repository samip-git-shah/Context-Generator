import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: APP_CONFIG.brand.name,
  description: APP_CONFIG.brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full dark">
      <body className="h-full">
        {children}
        <Toaster richColors theme="dark" position="top-center" />
      </body>
    </html>
  );
}
