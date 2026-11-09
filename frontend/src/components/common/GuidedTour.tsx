'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

export interface TourStep {
  targetSelector: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function GuidedTour({ steps, isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetRect = useCallback(() => {
    if (!isOpen || !steps[currentIndex]) return;
    const el = document.querySelector(steps[currentIndex].targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentIndex, isOpen, steps]);

  useEffect(() => {
    if (!isOpen) return;
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isOpen, currentIndex, updateTargetRect]);

  if (!isOpen || steps.length === 0) return null;

  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (onComplete) onComplete();
      onClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Calculate Tooltip position based on targetRect
  let tooltipStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    position: 'fixed',
  };

  if (targetRect) {
    const pad = 12;
    const pos = currentStep.position || 'bottom';

    if (pos === 'bottom') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.min(window.innerHeight - 280, targetRect.bottom + pad),
        left: Math.max(16, Math.min(window.innerWidth - 380, targetRect.left)),
      };
    } else if (pos === 'top') {
      tooltipStyle = {
        position: 'fixed',
        bottom: window.innerHeight - targetRect.top + pad,
        left: Math.max(16, Math.min(window.innerWidth - 380, targetRect.left)),
      };
    } else if (pos === 'right') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, targetRect.top),
        left: Math.min(window.innerWidth - 380, targetRect.right + pad),
      };
    } else if (pos === 'left') {
      tooltipStyle = {
        position: 'fixed',
        top: Math.max(16, targetRect.top),
        right: window.innerWidth - targetRect.left + pad,
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* Dimmed Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Target Element Spotlight Highlight */}
      {targetRect && (
        <motion.div
          layoutId="tour-spotlight"
          initial={false}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)',
          }}
          className="rounded-2xl border-2 border-indigo-400 pointer-events-none ring-4 ring-indigo-500/20 shadow-2xl z-50"
        />
      )}

      {/* Interactive Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          style={tooltipStyle}
          className="w-[360px] bg-white rounded-2xl shadow-2xl border border-indigo-100 p-5 z-50 pointer-events-auto select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Exit Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Hinglish Content */}
          <h4 className="text-base font-bold text-slate-900 mb-1.5">{currentStep.title}</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
            {currentStep.content}
          </p>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Peeche
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs inline-flex items-center gap-1.5 active:scale-95"
              >
                <span>{isLast ? 'Complete!' : 'Aage Chalein'}</span>
                {isLast ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
