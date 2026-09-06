import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./theme/ThemeContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import MonthlyReportViewPage from "./pages/MonthlyReportViewPage";
import ProjectCloseoutReportPage from "./pages/ProjectCloseoutReportPage";
import ReportsPage from "./pages/ReportsPage";
import LessonsLearnedPage from "./pages/LessonsLearnedPage";
import AdminUsersPage from "./pages/AdminUsersPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/reports/:reportId"
            element={
              <ProtectedRoute>
                <MonthlyReportViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/closeout-report"
            element={
              <ProtectedRoute>
                <ProjectCloseoutReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons-learned"
            element={
              <ProtectedRoute>
                <LessonsLearnedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
