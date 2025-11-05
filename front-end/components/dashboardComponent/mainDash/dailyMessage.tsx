'use client';

import { useEffect, useState } from "react";
import { XAxis, YAxis, Tooltip,  ResponsiveContainer, AreaChart, Area } from "recharts";
import { getDailyMessages } from "@/lib/apicall/dashboard";
import { format } from "date-fns";
import { CustomTooltip } from "./chartComponent";
export const DailyMessagesChart = () => {
  const [data, setData] = useState<{ date: string; total_messages: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const response = await getDailyMessages(localStorage.getItem("token") as string)
        setData(response);
      } catch (error) {
        console.error("Error fetching daily messages:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="messageGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
        </linearGradient>
      </defs>
      {/* <CartesianGrid 
          strokeDasharray="3 3" 
          className="text-muted-foreground"
        /> */}
      <XAxis 
        dataKey="date" 
        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
        stroke="#374151" // Dark text for better contrast
        tick={{ fill: '#374151' }} // Dark text for tick labels
      />
      <YAxis 
        stroke="#374151"
        tick={{ fill: '#374151' }}
      />
      <Tooltip 
        content={<CustomTooltip />}
        // Custom tooltip stays light themed
      />
      <Area 
        type="monotone" 
        dataKey="total_messages" 
        stroke="#82ca9d" 
        fill="url(#messageGradient)" 
      />
    </AreaChart>
  </ResponsiveContainer>
  
  );
};
