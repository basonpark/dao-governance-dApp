import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import RainbowKit CSS and Providers
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";

// Import Navbar
import { Navbar } from "@/components/layout/Navbar"; // Adjust path if needed

// Import Toaster for displaying notifications
import { Toaster } from "@/components/ui/sonner"; // Adjust path if needed

// Define Inter font with variable name for consistent usage
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Define the CSS variable used in Tailwind config
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusVoice DAO", // Updated title
  description: "Participate in on-chain governance with NexusVoice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      {" "}
      {/* Added inter.variable to html for global access */}
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <Providers>
          <Navbar /> {/* Add Navbar here */}
          <main className="container mx-auto px-4 py-8 flex-grow">
            {children}
          </main>
          <Toaster /> {/* Add Toaster here for notifications */}
          {/* Optional Footer could go here */}
          {/* <footer className="py-4 border-t mt-auto">Footer Content</footer> */}
        </Providers>
      </body>
    </html>
  );
}
