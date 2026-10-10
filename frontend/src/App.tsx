import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { PatientInputPage } from './pages/PatientInputPage'
import { PatientsPage } from './pages/PatientsPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { ResultsPage } from './pages/ResultsPage'
import { Heart3DPage } from './pages/Heart3DPage'
import { ExplainabilityPage } from './pages/ExplainabilityPage'
import { ModelPerformancePage } from './pages/ModelPerformancePage'
import { ReportsPage } from './pages/ReportsPage'
import { DatasetPage } from './pages/DatasetPage'
import { AboutPage } from './pages/AboutPage'
import { SettingsPage } from './pages/SettingsPage'
import { MainLayout } from './components/layout/MainLayout'
import { SimpleLayout } from './components/layout/MainLayout'

function App() {
  return (
    <Routes>
      {/* Public routes with simple layout */}
      <Route path="/" element={<SimpleLayout><LandingPage /></SimpleLayout>} />
      
      {/* Protected routes with main layout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients/new" element={<PatientInputPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="/heart-3d" element={<Heart3DPage />} />
        <Route path="/explainability" element={<ExplainabilityPage />} />
        <Route path="/model-performance" element={<ModelPerformancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/dataset" element={<DatasetPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App