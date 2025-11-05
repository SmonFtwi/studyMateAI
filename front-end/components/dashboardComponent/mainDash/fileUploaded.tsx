'use client';

import { useEffect, useState } from "react";
import {  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getFilesUploaded } from "@/lib/apicall/dashboard";
import { format } from "date-fns";
import { CustomTooltip } from "./chartComponent";
export const FilesUploadedChart = () => {
  const [data, setData] = useState<{ date: string; total_files: number }[]>([]);

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

  return (
    <ResponsiveContainer width="100%" height={300}>
       <BarChart data={data}>
       <XAxis 
          dataKey="date" 
          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
          className="text-gray-900 dark:text-gray-200"
        />
        <YAxis />
      <Tooltip content={<CustomTooltip/>} />
       <Bar  dataKey="total_files"  fill="#83a6ed" barSize={30} />
       </BarChart>
       
        {/* <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> */}
        
        
    </ResponsiveContainer>
  );
};
