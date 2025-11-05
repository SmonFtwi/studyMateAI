import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProps } from "recharts";
import { format } from "date-fns";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Card className=" shadow-none">
    <CardHeader>
      <CardTitle className="text-lg font-semibold ">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);





export const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-4 shadow-lg rounded-lg border">
        <p className="text-sm text-gray-600 dark:text-gray-300">{format(new Date(label), "MMM dd, yyyy")}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};




export const CustomBarTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-4 shadow-lg rounded-lg border">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm font-semibold"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
