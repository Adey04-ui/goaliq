
import LogsExplorer from "@/app/components/analytics/LogsExplorer";

export const metadata = {
  title: "Frontend Logs | Goaliq Admin",
};

export default function FrontendLogsPage() {
  return <LogsExplorer type="frontend" />;
}