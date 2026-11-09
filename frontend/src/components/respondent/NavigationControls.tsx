'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface NavigationControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onPrev: () => void;
  onNext: () => void;
  primaryColor?: string;
}

export function NavigationControls({
  canGoBack,
  canGoForward,
  onPrev,
  onNext,
  primaryColor = '#6366F1',
}: NavigationControlsProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 select-none">
      <div className="flex items-center bg-white shadow-lg border border-slate-200/80 rounded-xl overflow-hidden p-0.5">
        <button
          onClick={onPrev}
          disabled={!canGoBack}
          aria-label="Previous question"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Previous (Shift + Tab or Up Arrow)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <div className="h-4 w-[1px] bg-slate-200" />
        <button
          onClick={onNext}
          disabled={!canGoForward}
          aria-label="Next question"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Next (Enter or Down Arrow)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
