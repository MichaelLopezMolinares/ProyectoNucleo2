import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AcademicPage from './pages/AcademicPage';
import TeachersPage from './pages/TeachersPage';
import ClassroomsPage from './pages/ClassroomsPage';
import ScheduleEnginePage from './pages/ScheduleEnginePage';
import SchedulesPage from './pages/SchedulesPage';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedPage><DashboardPage /></ProtectedPage>} />
          <Route path="/academic" element={<ProtectedPage><AcademicPage /></ProtectedPage>} />
          <Route path="/teachers" element={<ProtectedPage><TeachersPage /></ProtectedPage>} />
          <Route path="/classrooms" element={<ProtectedPage><ClassroomsPage /></ProtectedPage>} />
          <Route path="/schedule-engine" element={<ProtectedPage><ScheduleEnginePage /></ProtectedPage>} />
          <Route path="/schedules" element={<ProtectedPage><SchedulesPage /></ProtectedPage>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
