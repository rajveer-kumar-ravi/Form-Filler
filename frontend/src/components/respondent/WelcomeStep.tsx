'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CornerDownLeft, Sparkles, Clock } from 'lucide-react';
import { ScreenConfig, ThemeConfig } from '@/types/form';

interface WelcomeStepProps {
  welcomeScreen: ScreenConfig;
  theme: ThemeConfig;
  totalQuestions: number;
  onStart: () => void;
}

export function WelcomeStep({
  welcomeScreen,
  theme,
  totalQuestions,
  onStart,
}: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="max-w-2xl w-full mx-auto px-6 text-left space-y-6"
    >
      <div className="space-y-4">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
          style={{ color: theme.textColor || '#0F172A' }}
        >
          {welcomeScreen.title || 'Welcome'}
        </h1>

        {welcomeScreen.description && (
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-normal max-w-xl">
            {welcomeScreen.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Takes 2 mins
        </span>
        <span>•</span>
        <span>{totalQuestions} questions</span>
      </div>

      <div className="pt-4 flex items-center gap-3">
        <button
          onClick={onStart}
          className="px-8 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2.5 text-base"
          style={{ backgroundColor: theme.primaryColor || '#6366F1' }}
        >
          <span>{welcomeScreen.buttonText || 'Start'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
          press <strong className="font-semibold text-slate-600">Enter ↵</strong>
        </span>
      </div>
    </motion.div>
  );
}
