import React, { useState } from 'react';
import { useAppContext } from '../context';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const Admin: React.FC = () => {
  const { t, data, setData, isLoading } = useAppContext();
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState(data);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setLoggedIn(true);
      // Synchronize state with context after login
      setFormData(data);
    } else {
      alert('Wrong password');
    }
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
                <Label htmlFor="password">{t.password}</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter admin123"
                  className="w-full"
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
        <CardHeader>
          <CardTitle className="text-2xl text-primary">{t.adminDashboard} - {t.editSchedule}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
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
