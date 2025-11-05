'use client';

import { DailyMessagesChart } from "./dailyMessage";
import { TopUsersChart } from "./userRegistration";
import { FilesUploadedChart } from "./fileUploaded";
import { DailySessionsChart } from "./dailySession";
import { ChartCard } from "./chartComponent";

const DashboardCharts = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartCard title="Daily Messages">
          <DailyMessagesChart />
        </ChartCard>
        <ChartCard title="Chat Activity by User">
          <TopUsersChart />
        </ChartCard>
        <ChartCard title="Files Uploaded">
          <FilesUploadedChart />
        </ChartCard>
        <ChartCard title="Daily Sessions">
          <DailySessionsChart />
        </ChartCard>
      </div>
    );
  };

export default DashboardCharts;
