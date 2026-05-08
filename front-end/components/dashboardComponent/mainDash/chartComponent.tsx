import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProps } from "recharts";
import { format } from "date-fns";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Card className="glass-cosmos border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] overflow-hidden">
    <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
      <CardTitle className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-6">{children}</CardContent>
  </Card>
);

export const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-cosmos p-4 shadow-xl rounded-xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {label ? format(new Date(label), "MMM dd, yyyy") : ""}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                <span className="opacity-70">{entry.name}:</span> {entry.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const CustomBarTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-cosmos p-4 shadow-xl rounded-xl border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                <span className="opacity-70">{entry.name}:</span> {entry.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
