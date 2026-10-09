
import LogsExplorer from "@/app/components/analytics/LogsExplorer";

export const metadata = {
  title: "Backend Logs | Goaliq Admin",
};

export default function BackendLogsPage() {
  return <LogsExplorer type="backend" />;
}