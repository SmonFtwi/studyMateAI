"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { getDailySessions } from "@/lib/apicall/dashboard";
import { format } from "date-fns";
import { CustomTooltip } from "./chartComponent";
import { useTheme } from "next-themes";

export const DailySessionsChart = () => {
  const [data, setData] = useState<{ date: string; total_sessions: number }[]>(
    [],
  );
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setError(false);
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await getDailySessions(
          localStorage.getItem("token") as string,
        );
        setData(response);
      } catch (error) {
        setError(true);
        console.error("Error fetching daily sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attempt]);

  const strokeColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  if (loading)
    return (
      <p role="status" className="muted py-10 text-sm">
        Loading activity…
      </p>
    );
  if (error)
    return (
      <div role="alert" className="muted py-10 text-sm">
        Activity is unavailable.{" "}
        <button
          className="accent underline"
          onClick={() => setAttempt((v) => v + 1)}
        >
          Try again
        </button>
      </div>
    );
  if (!data.length)
    return <p className="muted py-10 text-sm">No activity recorded yet.</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={gridColor}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "MMM dd")}
          stroke={strokeColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke={strokeColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="total_sessions"
          stroke="#8b5cf6"
          strokeWidth={3}
          fill="url(#sessionsGradient)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
