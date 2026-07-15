import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context';
import type { Language } from '../i18n';
import { Button } from '@/components/ui/button';


export const Navbar: React.FC = () => {
  const { lang, setLang, t, selectedClass, setSelectedClass, availableClasses } = useAppContext();
  const location = useLocation();

  const langs: Language[] = ['id', 'en', 'ur'];

  return (
    <nav className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 mb-6 bg-card rounded-lg border shadow-sm">
      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <Button variant={location.pathname === '/' ? 'default' : 'ghost'} asChild>
          <Link to="/">{t.home}</Link>
        </Button>
        <Button variant={location.pathname === '/roster' ? 'default' : 'ghost'} className="step-nav-roster" asChild>
          <Link to="/roster">{t.roster}</Link>
        </Button>
        <Button variant={location.pathname === '/calendar' ? 'default' : 'ghost'} className="step-nav-calendar" asChild>
          <Link to="/calendar">{t.calendar}</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
        <div className="step-nav-class w-full md:w-auto overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {availableClasses.map(c => (
              <Button
                key={c}
                variant={selectedClass === c ? 'default' : 'outline'}
                className="rounded-full whitespace-nowrap transition-colors duration-200"
                onClick={() => {
                  if (!document.startViewTransition) {
                    setSelectedClass(c);
                  } else {
                    document.startViewTransition(() => setSelectedClass(c));
                  }
                }}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        <div className="step-lang flex gap-1">
          {langs.map(l => (
            <Button 
              key={l} 
              variant={lang === l ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};
