'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, Sparkles, RefreshCw } from 'lucide-react';
import { ScreenConfig, ThemeConfig } from '@/types/form';

interface ThankYouStepProps {
  thankYouScreen: ScreenConfig;
  theme: ThemeConfig;
  onRestart: () => void;
}

export function ThankYouStep({ thankYouScreen, theme, onRestart }: ThankYouStepProps) {
  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [theme.primaryColor || '#6366F1', '#38BDF8', '#34D399', '#F472B6'],
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }
  }, [theme.primaryColor]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-xl w-full mx-auto px-6 text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-lg"
        style={{
          backgroundColor: theme.primaryColor || '#6366F1',
          color: '#FFFFFF',
        }}
      >
        <Check className="w-8 h-8 stroke-[3]" />
      </motion.div>

      <div className="space-y-3">
        <h2
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ color: theme.textColor || '#0F172A' }}
        >
          {thankYouScreen.title || 'Thank You!'}
        </h2>
        <p className="text-base text-slate-500 leading-relaxed font-normal max-w-md mx-auto">
          {thankYouScreen.description || 'Your response has been successfully recorded.'}
        </p>
      </div>

      <div className="pt-4 flex flex-col items-center gap-4">
        {thankYouScreen.buttonText && (
          <button
            onClick={onRestart}
            className="px-6 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            {thankYouScreen.buttonText}
          </button>
        )}

        <div className="pt-8 flex items-center gap-1.5 text-xs text-slate-400">
          <span>Powered by</span>
          <span className="font-bold text-slate-700 tracking-tight flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            FormFlow
          </span>
        </div>
      </div>
    </motion.div>
  );
}
