'use client';

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip,  ResponsiveContainer } from "recharts";
import { getUserRegistrations } from "@/lib/apicall/dashboard";
import { CustomBarTooltip } from "./chartComponent";

interface TopUserData {
  username: string;
  total_messages: number;
}

export const TopUsersChart = () => {
  const [data, setData] = useState<TopUserData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserRegistrations(localStorage.getItem("token") as string)
        setData(response);
      } catch (error) {
        console.error("Error fetching top users:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        
        <XAxis 
          dataKey="username" 
          label={{ value: "Users", position: "insideBottom", dy: 10 }}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          label={{ value: "Total Messages", angle: -90, position: "insideLeft", dx: 0 }}
        />
        <Tooltip content={<CustomBarTooltip/>} />
        <Bar dataKey="total_messages" fill="#82ca9d" barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
};
