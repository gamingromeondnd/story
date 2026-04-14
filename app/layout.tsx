import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/contexts/AuthContext";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "StoryScape",
  description:
    "Mobile-first audio subscription platform with topic-based access, plan control, and manual PayPal approval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${manrope.variable}`}>
      <body className="min-h-full">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
