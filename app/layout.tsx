import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Container from "../components/layout/Container";
import SocketProvide from "../providers/SocketProvide";
import { cn } from "../lib/utils";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VideoChat",
  description: "For Live Video Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            "antialiased",
            "relative"
          )}
        >
          <SocketProvide>
            <main className="flex flex-col min-h-screen bg-secondary ">
              <Navbar />
              <Container>{children}</Container>
            </main>
          </SocketProvide>
        </body>
      </html>
    </ClerkProvider>
  );
}
