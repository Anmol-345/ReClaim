import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HomeLogoHome from "@/components/HomeLogo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ReClaim",
  description: "Lost & Found Reclaim Platform",
  icons: {
    icon: "/favicon-2.ico",
    shortcut: "/favicon-2.ico",
    apple: "/apple-touch-icon.png",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HomeLogoHome/>
        {children}
      </body>
    </html>
  );
}
