import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Roster } from './pages/Roster';
import { AcademicCalendar } from './pages/AcademicCalendar';
import { Admin } from './pages/Admin';
import { Teacher } from './pages/Teacher';
import { Tutorial } from './components/Tutorial';

const AppContent: React.FC = () => {
  const { selectedClass } = useAppContext();
  return (
    <Router>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              Kelas 1 {selectedClass} Mudipas49
            </h1>
          </header>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/calendar" element={<AcademicCalendar />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/teacher" element={<Teacher />} />
          </Routes>
          <Tutorial />
        </div>
      </div>
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
