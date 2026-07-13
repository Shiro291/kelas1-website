import React, { useState } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '../lib/supabase';
import { LogOut, CalendarDays } from 'lucide-react';

export const Admin: React.FC = () => {
  const { t, data, setData, isLoading, selectedDate, setSelectedDate } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState(data);

  React.useEffect(() => {
    setFormData(data);
  }, [data]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLoggedIn(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await setData(formData);
    setIsSaving(false);
    alert('Data saved successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Memuat...</div>;
  }

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">{t.login}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="admin@mudipas49.com"
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter password"
                  className="w-full"
                  required
                />
              </div>
              <Button type="submit" className="w-full">{t.login}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <Card className="shadow-lg border-t-4 border-t-primary">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-2xl text-primary">{t.adminDashboard}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5 text-slate-500" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 mt-4">
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
              <Label htmlFor="target_date" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Tanggal Kegiatan
              </Label>
              <Input 
                id="target_date" 
                type="date"
                name="target_date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                className="w-full sm:w-auto"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Data di bawah ini adalah untuk tanggal yang dipilih di atas.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">{t.schedule}</Label>
              <Input id="schedule" name="schedule" value={formData.schedule} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homework">{t.homework}</Label>
              <Input id="homework" name="homework" value={formData.homework} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniform">{t.uniform}</Label>
              <Input id="uniform" name="uniform" value={formData.uniform} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highlights">{t.highlights}</Label>
              <Textarea 
                id="highlights" 
                name="highlights" 
                value={formData.highlights} 
                onChange={handleChange} 
                rows={4} 
              />
            </div>
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? 'Menyimpan...' : t.save}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
