"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Sidebar from "@/components/tutor/Sidebar";
import TopNav from "@/components/tutor/TopNav";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Skip auth check for login page
  const isLoginPage = pathname === "/tutor/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("tutor_token");
    if (!token) {
      router.push("/tutor/login");
    } else {
      setIsLoading(false);
    }
  }, [router, isLoginPage]);

  // Show login page without layout
  if (isLoginPage) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  if (isLoading) {
    return (
      <ThemeProvider>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <Sidebar />
        <TopNav />
        <main
          className="transition-all duration-300 pt-16 pl-64"
          style={{ minHeight: "100vh" }}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}

