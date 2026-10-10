import { Suspense } from "react";
import LogsExplorer from "@/app/components/analytics/LogsExplorer";

export const metadata = {
  title: "Backend Logs | Goaliq Admin",
};

export default function BackendLogsPage() {
  return (
    <Suspense fallback={<div>Loading backend logs...</div>}>
      <LogsExplorer type="backend" />
    </Suspense>
  );
}