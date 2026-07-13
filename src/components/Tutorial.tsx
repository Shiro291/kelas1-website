import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { EventData, Step } from 'react-joyride';
import { useAppContext } from '../context';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Tutorial: React.FC = () => {
  const { t } = useAppContext();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const isTutorialCompleted = localStorage.getItem('tutorial_completed');
    if (!isTutorialCompleted) {
      setRun(true);
    }
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: t.tourWelcome,
      skipBeacon: true,
    },
    {
      target: '.step-lang',
      content: t.tourLang,
    },
    {
      target: '.step-home-date',
      content: t.tourDate,
    },
    {
      target: '.step-home-cards',
      content: t.tourCards,
    },
    {
      target: '.step-nav-roster',
      content: t.tourRoster,
    },
    {
      target: '.step-nav-calendar',
      content: t.tourCalendar,
    }
  ];

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('tutorial_completed', 'true');
    }
  };

  const startTutorial = () => {
    setRun(true);
  };

  return (
    <>
      <Joyride
        onEvent={handleJoyrideCallback}
        continuous
        run={run}
        scrollToFirstStep
        steps={steps}
        locale={{
          back: t.tourBack,
          close: t.tourClose,
          last: t.tourClose,
          next: t.tourNext,
          skip: t.tourSkip,
        }}
        options={{
          zIndex: 10000,
          primaryColor: '#0f172a',
          showProgress: true,
          buttons: ['back', 'skip', 'primary'],
        }}
      />
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 left-6 rounded-full shadow-lg z-50 w-12 h-12"
        onClick={startTutorial}
        title="Help / Tutorial"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    </>
  );
};
