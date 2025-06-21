import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import Navbar from "@/components/navbar";
import { IntegrationProvider } from "@/context/integration-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VectorShift Frontend",
  description: "Integration platform for VectorShift",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <Providers>
          <IntegrationProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">
                {children}
              </div>
            </div>
          </IntegrationProvider>
        </Providers>  
      </body>
    </html>
  );
}