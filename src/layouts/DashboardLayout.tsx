import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';

export const DashboardLayout: React.FC = () => {
  const { selectedClass } = useAppContext();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Dashboard - Kelas 1 {selectedClass}
          </h1>
          <button 
            onClick={() => navigate('/')} 
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Kembali ke Web
          </button>
        </header>
        <Outlet />
      </div>
    </div>
  );
};
