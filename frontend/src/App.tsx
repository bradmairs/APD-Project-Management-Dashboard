import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  );
}
