'use client';

import { useEffect, useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { getFilesUploaded } from "@/lib/apicall/dashboard";
import { format } from "date-fns";
import { CustomTooltip } from "./chartComponent";
import { useTheme } from "next-themes";

export const FilesUploadedChart = () => {
  const [data, setData] = useState<{ date: string; total_files: number }[]>([]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFilesUploaded(localStorage.getItem("token") as string)
        setData(response);
      } catch (error) {
        console.error("Error fetching files uploaded:", error);
      }
    };

    fetchData();
  }, []);

  const strokeColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <ResponsiveContainer width="100%" height={300}>
       <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
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
        <Tooltip content={<CustomTooltip/>} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        <Bar 
          dataKey="total_files" 
          fill="#6366f1" 
          radius={[4, 4, 0, 0]}
          barSize={32}
          animationDuration={1500}
        />
       </BarChart>
    </ResponsiveContainer>
  );
};
