import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '../context';
import { supabase } from '../lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const DashboardLayout: React.FC = () => {
  const { selectedClass, setSelectedClass, availableClasses } = useAppContext();
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/admin');
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r md:min-h-screen p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h2 className="font-bold text-lg">{isSuperAdmin ? 'Super Admin' : 'Teacher'}</h2>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Button variant={location.pathname === (isSuperAdmin ? '/admin' : '/teacher') ? 'secondary' : 'ghost'} className="justify-start gap-3" asChild>
            <Link to={isSuperAdmin ? '/admin' : '/teacher'}>
              <Home className="w-4 h-4" />
              Beranda
            </Link>
          </Button>
          
          {isSuperAdmin && (
            <Button variant={location.pathname === '/admin/users' ? 'secondary' : 'ghost'} className="justify-start gap-3" asChild>
              <Link to="/admin">
                <Users className="w-4 h-4" />
                Manajemen Guru
              </Link>
            </Button>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 flex flex-col max-h-screen overflow-auto">
        <header className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Learning Management System</h1>
            <p className="text-muted-foreground text-sm">Mudipas - Dashboard {isSuperAdmin ? 'Super Admin' : 'Guru'}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Pilih Kelas:</span>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
