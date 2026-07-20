'use client';

import { useClarifyStore } from '@/lib/clarify-store';
import { STAGES, OUTPUTS } from '@/lib/clarify-types';
import { StageNav } from './stage-nav';
import { WelcomeScreen } from './welcome-screen';
import { PersonSelector } from './person-selector';
import { Stage1Who } from './stage1-who';
import { Stage2Known } from './stage2-known';
import { Stage3Unknown } from './stage3-unknown';
import { Stage4Discuss } from './stage4-discuss';
import { Stage5Next } from './stage5-next';
import { OutputsHub } from './outputs-hub';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ClarifyShell() {
  const started = useClarifyStore((s) => s.started);
  const currentStage = useClarifyStore((s) => s.currentStage);
  const setStage = useClarifyStore((s) => s.setStage);
  const persons = useClarifyStore((s) => s.persons);
  const activePersonId = useClarifyStore((s) => s.activePersonId);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading Clarify…</div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <WelcomeScreen />
        </main>
        <ClarifyFooter />
      </div>
    );
  }

  const stageInfo = currentStage <= 5 ? STAGES[currentStage - 1] : null;
  const hasPersons = persons.length > 0;
  const showPersonSelector = currentStage >= 1 && hasPersons;
  const isFirstStage = currentStage === 1;
  const isOutputsStage = currentStage === 6;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">HF</span>
            </div>
            <span className="font-semibold text-sm">HeartFirst <span className="text-muted-foreground">Clarify</span></span>
          </div>
          <span className="text-xs text-muted-foreground">All data stays on your device</span>
        </div>
      </header>

      <main className="flex-1 print:p-0" id="clarify-main">
        <div className="max-w-4xl mx-auto px-4 py-6 print:max-w-none print:px-0 print:py-0">
          <StageNav />

          {showPersonSelector && (
            <PersonSelector showAdd={isFirstStage} />
          )}

          {!hasPersons && !isOutputsStage && (
            <Stage1Who />
          )}

          {hasPersons && currentStage === 1 && <Stage1Who />}
          {currentStage === 2 && hasPersons && <Stage2Known />}
          {currentStage === 3 && hasPersons && <Stage3Unknown />}
          {currentStage === 4 && hasPersons && <Stage4Discuss />}
          {currentStage === 5 && hasPersons && <Stage5Next />}
          {isOutputsStage && <OutputsHub />}

          {/* Stage navigation buttons */}
          {!isOutputsStage && hasPersons && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border print:hidden">
              <Button
                variant="outline"
                onClick={() => setStage(Math.max(1, currentStage - 1))}
                disabled={currentStage === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={() => setStage(currentStage + 1)}
              >
                {currentStage === 5 ? 'View outputs' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {isOutputsStage && (
            <div className="mt-8 pt-6 border-t border-border print:hidden">
              <Button
                variant="outline"
                onClick={() => setStage(Math.max(1, currentStage - 1))}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to stages
              </Button>
            </div>
          )}
        </div>
      </main>

      <ClarifyFooter />
    </div>
  );
}

function ClarifyFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background print:hidden">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Clarify is not a diagnostic tool or substitute for professional medical advice.</span>
          </div>
          <span>© {new Date().getFullYear()} HeartFirst by Shyntesy</span>
        </div>
      </div>
    </footer>
  );
}