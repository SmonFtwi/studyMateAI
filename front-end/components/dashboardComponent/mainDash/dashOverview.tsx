"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, FileText, LayoutGrid } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalChatMessages: number;
  totalChatSessions: number;
  totalFiles: number;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setError(false);
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_backend_url}/dash/overview`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data: DashboardStats = await response.json();
        setStats(data);
      } catch {
        setError(true);
      }
    };

    fetchStats();
  }, [attempt]);

  if (error)
    return (
      <div className="notice" role="alert">
        Analytics are currently unavailable.{" "}
        <button
          className="accent underline ml-2"
          onClick={() => setAttempt((v) => v + 1)}
        >
          Try again
        </button>
      </div>
    );
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg font-semibold animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Chat Messages",
      value: stats.totalChatMessages,
      icon: MessageCircle,
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Chat Sessions",
      value: stats.totalChatSessions,
      icon: LayoutGrid,
      color: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Files",
      value: stats.totalFiles,
      icon: FileText,
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="glass-cosmos border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 "
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium muted">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-black ${stat.color} tracking-tight`}
              >
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
