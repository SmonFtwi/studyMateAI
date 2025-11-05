'use client';

import { useEffect, useState } from "react";
import {  XAxis, YAxis, Tooltip,  ResponsiveContainer, AreaChart, Area } from "recharts";
import { getDailySessions } from "@/lib/apicall/dashboard";
import { format } from "date-fns";
import { CustomTooltip } from "./chartComponent";
export const DailySessionsChart = () => {
  const [data, setData] = useState<{ date: string; total_sessions: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDailySessions(localStorage.getItem('token') as string);
        setData(response);
      } catch (error) {
        console.error("Error fetching daily sessions:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#83a6ed" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#83a6ed" stopOpacity={0}/>
        </linearGradient>
      </defs>
      {/* <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> */}
      <XAxis 
        dataKey="date" 
        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
      />
      <YAxis />
      <Tooltip content={<CustomTooltip />} />
      <Area 
        type="monotone" 
        dataKey="total_sessions" 
        stroke="#83a6ed" 
        fill="url(#sessionsGradient)" 
      />
    </AreaChart>
  </ResponsiveContainer>
  );
};
