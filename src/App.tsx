import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context';
import { Home } from './pages/Home';
import { Roster } from './pages/Roster';
import { AcademicCalendar } from './pages/AcademicCalendar';
import { Admin } from './pages/Admin';
import { Teacher } from './pages/Teacher';
import { Tutorial } from './components/Tutorial';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/calendar" element={<AcademicCalendar />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/teacher" element={<Teacher />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Tutorial />
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
