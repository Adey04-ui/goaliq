import { Suspense } from "react";
import LogsExplorer from "@/app/components/analytics/LogsExplorer";

export const metadata = {
  title: "Frontend Logs | Goaliq Admin",
};

export default function FrontendLogsPage() {
  return (
    <Suspense fallback={<div>Loading frontend logs...</div>}>
      <LogsExplorer type="frontend" />
    </Suspense>
  );
}