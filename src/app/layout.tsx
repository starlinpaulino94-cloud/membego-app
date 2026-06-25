import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Club de Beneficios QR — Beneficios exclusivos con tu código QR",
  description: "Regístrate, elige una promoción disponible y recibe tu código QR para aprovechar beneficios en nuestros negocios participantes.",
  keywords: ["Club de Beneficios", "QR", "beneficios", "promociones", "carwash", "restaurante", "membresías"],
  authors: [{ name: "Club de Beneficios QR" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
