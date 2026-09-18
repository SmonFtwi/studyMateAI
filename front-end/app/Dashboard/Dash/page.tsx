"use client";

import DashboardCharts from "@/components/dashboardComponent/mainDash/dashboardCharts";
import DashboardOverview from "@/components/dashboardComponent/mainDash/dashOverview";

const Dashboard = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <p className="eyebrow mb-2">Study activity</p>
        <h1 className="page-heading">Analytics</h1>
        <p className="muted mt-3 text-sm">
          A view of the activity recorded by your workspace.
        </p>
      </div>
      <DashboardOverview />
      <DashboardCharts />
    </div>
  );
};

export default Dashboard;
