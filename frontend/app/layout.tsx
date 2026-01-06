import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMS - Learning Management System",
  description: "Learning Management System",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}



