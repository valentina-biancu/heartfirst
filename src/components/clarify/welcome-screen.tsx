'use client';

import { useClarifyStore } from '@/lib/clarify-store';
import { cn } from '@/lib/utils';
import { Heart, Shield, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WelcomeScreen() {
  const started = useClarifyStore((s) => s.started);
  const persons = useClarifyStore((s) => s.persons);
  const startSession = useClarifyStore((s) => s.startSession);
  const setStage = useClarifyStore((s) => s.setStage);
  const resetSession = useClarifyStore((s) => s.resetSession);

  if (started) return null;

  const hasExistingData = persons.length > 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight">HeartFirst</h1>
            <p className="text-sm text-muted-foreground font-medium">Clarify</p>
          </div>
        </div>

        {/* Main heading */}
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Bring clarity to heart risk
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
          Gather what is known, identify what remains unclear, prepare for a health team conversation, and record what happens next — for yourself or someone you love.
        </p>

        {/* Not-a-tool notice */}
        <div className="bg-muted/50 border border-border rounded-xl p-4 mb-8 text-left max-w-lg mx-auto">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground mb-1">Important</p>
              <p>
                Clarify is not a diagnostic tool, clinical risk calculator, treatment recommendation system, or substitute for a qualified health professional. It helps you organise information and prepare for informed conversations.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        {hasExistingData ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={startSession} className="text-base px-8">
              <Heart className="w-4 h-4 mr-2" />
              Continue where you left off
            </Button>
            <Button variant="outline" size="lg" onClick={resetSession} className="text-base px-8">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start fresh
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={startSession} className="text-base px-8">
            <Heart className="w-4 h-4 mr-2" />
            Begin Clarify
          </Button>
        )}

        {/* Privacy note */}
        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>All data stays on your device. No account required.</span>
        </div>
      </div>
    </div>
  );
}