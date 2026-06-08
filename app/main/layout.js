import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function RootLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <Topbar />
      {children}
    </div>
  )
}