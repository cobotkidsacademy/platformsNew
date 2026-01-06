"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/lib/api/client";

interface LeaderboardEntry {
  rank: number;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
  };
  total_points: number;
  quizzes_completed: number;
  quizzes_passed: number;
  average_score: number;
}

export default function LeaderboardPage() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("class_id");

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"global" | "class">(classId ? "class" : "global");

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, classId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const endpoint =
        scope === "class" && classId
          ? `/quizzes/leaderboard/class/${classId}?limit=50`
          : "/quizzes/leaderboard/global?limit=50";
      const response = await apiClient.get(endpoint);
      setLeaderboard(response.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-400 to-yellow-500";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-700";
      default:
        return "bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4 text-xl">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 animate-bounce">
            🏆
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-white/80">Top quiz champions</p>
        </div>

        {/* Scope Toggle */}
        {classId && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setScope("class")}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                scope === "class"
                  ? "bg-white text-violet-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              My Class
            </button>
            <button
              onClick={() => setScope("global")}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                scope === "global"
                  ? "bg-white text-violet-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Global
            </button>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-4xl mb-2 shadow-lg">
                🥈
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center w-24">
                <p className="text-white font-bold text-sm truncate">
                  {leaderboard[1].student.first_name}
                </p>
                <p className="text-white/80 text-xs">{leaderboard[1].total_points} pts</p>
              </div>
              <div className="w-24 h-20 bg-gray-300 rounded-t-xl mt-2"></div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-5xl mb-2 shadow-lg animate-pulse">
                🥇
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center w-28">
                <p className="text-white font-bold truncate">
                  {leaderboard[0].student.first_name}
                </p>
                <p className="text-white/80 text-sm">{leaderboard[0].total_points} pts</p>
              </div>
              <div className="w-28 h-28 bg-amber-400 rounded-t-xl mt-2"></div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg">
                🥉
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-3 text-center w-20">
                <p className="text-white font-bold text-sm truncate">
                  {leaderboard[2].student.first_name}
                </p>
                <p className="text-white/80 text-xs">{leaderboard[2].total_points} pts</p>
              </div>
              <div className="w-20 h-16 bg-amber-600 rounded-t-xl mt-2"></div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center text-sm font-medium text-gray-500">
              <span className="w-16">Rank</span>
              <span className="flex-1">Student</span>
              <span className="w-24 text-right">Points</span>
              <span className="w-20 text-right">Quizzes</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {leaderboard.map((entry) => (
              <div
                key={entry.student.id}
                className={`flex items-center p-4 ${
                  entry.rank <= 3 ? "bg-gradient-to-r from-amber-50 to-white" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-16">
                  {entry.rank <= 3 ? (
                    <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                  ) : (
                    <span className="text-gray-500 font-medium">#{entry.rank}</span>
                  )}
                </div>

                {/* Student */}
                <div className="flex-1 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      entry.rank <= 3 ? getRankColor(entry.rank) : "bg-violet-500"
                    }`}
                  >
                    {entry.student.first_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.student.first_name} {entry.student.last_name}
                    </p>
                    <p className="text-xs text-gray-500">@{entry.student.username}</p>
                  </div>
                </div>

                {/* Points */}
                <div className="w-24 text-right">
                  <p className="font-bold text-violet-600">{entry.total_points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>

                {/* Quizzes */}
                <div className="w-20 text-right">
                  <p className="font-medium text-gray-700">{entry.quizzes_completed}</p>
                  <p className="text-xs text-gray-500">completed</p>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏃</div>
              <p className="text-gray-500">No scores yet. Be the first to take a quiz!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

