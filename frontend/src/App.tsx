import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { OrgProvider } from "./auth/OrgContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { UndoToastProvider } from "./undo/UndoToastContext";
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
import TaskTemplatesPage from "./pages/TaskTemplatesPage";
import CmpDashboardPage from "./pages/CmpDashboardPage";
import CmpProjectDetailPage from "./pages/CmpProjectDetailPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrgProvider>
          <UndoToastProvider>
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
                path="/task-templates"
                element={
                  <ProtectedRoute>
                    <TaskTemplatesPage />
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
              <Route
                path="/cmp"
                element={
                  <ProtectedRoute>
                    <CmpDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cmp/projects/:id"
                element={
                  <ProtectedRoute>
                    <CmpProjectDetailPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </UndoToastProvider>
        </OrgProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
