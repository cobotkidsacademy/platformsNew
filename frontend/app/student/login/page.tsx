"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function StudentLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>("checking...");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await apiClient.get("/health");
        if (response.data.status === "ok") {
          setBackendStatus("connected");
        }
      } catch (err: any) {
        setBackendStatus("disconnected");
        console.error("Backend connection failed:", err.message);
      }
    };
    checkBackend();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/auth/student/login", {
        username: data.username,
        password: data.password,
      });

      if (response.data.token) {
        localStorage.setItem("student_token", response.data.token);
        localStorage.setItem("student_user", JSON.stringify(response.data.user));
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please check your username and password.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0F172A" }}>
      {/* Left Side - Branding & Fun Elements */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-3xl tracking-tight">COBOT</h1>
              <p className="text-white/80 text-sm">Student Portal</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 relative z-10">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Welcome Back,<br />Student! 🚀
          </h2>
          <p className="text-white/90 text-lg max-w-md">
            Continue your learning journey, take quizzes, track your progress, and climb the leaderboard!
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
              🎮 Interactive Quizzes
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
              📊 Track Progress
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
              🏆 Leaderboard
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
              📚 Study Materials
            </div>
          </div>
        </div>

        <p className="text-white/70 text-sm relative z-10">
          © 2025 COBOT LMS. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">🎓</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">COBOT</h1>
              <p className="text-slate-400 text-xs">Student Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              Welcome Back! 👋
            </h2>
            <p className="text-slate-400">
              Sign in to continue your learning adventure
            </p>
            <p className={`mt-2 text-xs ${
              backendStatus === "connected" ? "text-green-400" : 
              backendStatus === "disconnected" ? "text-red-400" : "text-slate-500"
            }`}>
              ● Backend: {backendStatus}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 animate-shake">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="text-sm text-red-400 flex-1">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <span>👤</span>
                Username
              </label>
              <input
                {...register("username")}
                type="text"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <span>❌</span>
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <span>🔒</span>
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m3.29 3.29L12 12m-3.29-3.29L3 3m9.29 9.29L12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <span>❌</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <a href="#" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading || backendStatus === "disconnected"}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 via-purple-600 to-pink-500 hover:from-violet-600 hover:via-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">💡 Need help?</p>
            <p className="text-sm text-slate-300">
              Contact your teacher or{" "}
              <a href="mailto:support@cobot.com" className="text-violet-400 hover:text-violet-300">
                support@cobot.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

