'use client'

import DashboardCharts from "@/components/dashboardComponent/mainDash/dashboardCharts";
import DashboardOverview from "@/components/dashboardComponent/mainDash/dashOverview";


const Dashboard = () => {


  

 

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <DashboardOverview/>
      <DashboardCharts/>
    </div>
  );
};

export default Dashboard;