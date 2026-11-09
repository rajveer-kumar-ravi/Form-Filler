'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { PublicForm, PublicQuestion } from '@/types/form';
import { ProgressBar } from '@/components/respondent/ProgressBar';
import { NavigationControls } from '@/components/respondent/NavigationControls';
import { WelcomeStep } from '@/components/respondent/WelcomeStep';
import { QuestionStep } from '@/components/respondent/QuestionStep';
import { ThankYouStep } from '@/components/respondent/ThankYouStep';
import { Loader2, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function PublicFormPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Form progression state
  // 'welcome' | number (0 .. questions.length - 1) | 'thank_you'
  const [currentStep, setCurrentStep] = useState<'welcome' | number | 'thank_you'>('welcome');
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch public form
  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);
        const data = await api.getPublicForm(shareId);
        setForm(data);
        if (!data.welcome_screen?.enabled && data.questions.length > 0) {
          setCurrentStep(0);
        } else {
          setCurrentStep('welcome');
        }
      } catch (err: any) {
        console.error('Failed to load form:', err);
        if (err.response?.status === 403) {
          setAccessError('This form is currently unpublished or not accepting submissions.');
        } else {
          setAccessError('Form not found. Please verify the URL.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [shareId]);

  // Validation function
  const validateCurrentQuestion = (): boolean => {
    if (typeof currentStep !== 'number' || !form) return true;
    const q = form.questions[currentStep];
    if (!q) return true;

    const val = answers[q.id];

    // Required check
    if (q.required) {
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'string' && !val.trim()) ||
        (Array.isArray(val) && val.length === 0)
      ) {
        setValidationError('This question requires an answer to proceed.');
        return false;
      }
    }

    // Email validation
    if (q.type === 'email' && val && typeof val === 'string' && val.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val.trim())) {
        setValidationError('Please enter a valid email address.');
        return false;
      }
    }

    // Number validation
    if (q.type === 'number' && val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (isNaN(num)) {
        setValidationError('Please enter a valid number.');
        return false;
      }
      if (q.settings?.min !== undefined && num < Number(q.settings.min)) {
        setValidationError(`Value must be at least ${q.settings.min}.`);
        return false;
      }
      if (q.settings?.max !== undefined && num > Number(q.settings.max)) {
        setValidationError(`Value must be at most ${q.settings.max}.`);
        return false;
      }
    }

    // File upload required check
    if (q.type === 'file_upload' && q.required) {
      if (!val || (!val.url && !val.filename)) {
        setValidationError('Please upload a PDF file to proceed.');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  // Submit all collected responses
  const handleSubmit = async () => {
    if (!form) return;
    setIsSubmitting(true);
    setValidationError(null);

    const payloadAnswers = Object.entries(answers).map(([qId, answerValue]) => ({
      question_id: Number(qId),
      answer_value: answerValue,
    }));

    try {
      await api.submitPublicResponse(shareId, {
        answers: payloadAnswers,
        completion_status: 'completed',
      });
      setCurrentStep('thank_you');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to submit response. Please try again.';
      setValidationError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move forward
  const handleNext = () => {
    if (!form) return;

    if (currentStep === 'welcome') {
      setCurrentStep(0);
      return;
    }

    if (typeof currentStep === 'number') {
      if (!validateCurrentQuestion()) return;

      const nextIndex = currentStep + 1;
      if (nextIndex < form.questions.length) {
        setCurrentStep(nextIndex);
        setValidationError(null);
      } else {
        // Last question reached - submit!
        handleSubmit();
      }
    }
  };

  // Move backward
  const handlePrev = () => {
    if (!form) return;
    setValidationError(null);

    if (typeof currentStep === 'number') {
      if (currentStep === 0) {
        if (form.welcome_screen?.enabled) {
          setCurrentStep('welcome');
        }
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside a textarea and pressing plain Enter (allow newline)
      if (
        e.target instanceof HTMLTextAreaElement &&
        e.key === 'Enter' &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' && (e.metaKey || e.altKey)) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown' && (e.metaKey || e.altKey)) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading form...</p>
        </div>
      </div>
    );
  }

  // Unpublished or not found screen
  if (accessError || !form) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Form Not Available</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {accessError || 'This form cannot be accessed at this time.'}
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              Return to FormFlow
            </a>
          </div>
        </div>
      </div>
    );
  }

  const questionsCount = form.questions.length;
  const progressPercent =
    currentStep === 'welcome'
      ? 0
      : currentStep === 'thank_you'
      ? 100
      : Math.round(((currentStep + 1) / Math.max(1, questionsCount)) * 100);

  const theme = form.theme_config || {
    primaryColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    textColor: '#0F172A',
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between relative selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300"
      style={{
        backgroundColor: theme.backgroundColor || '#FFFFFF',
        color: theme.textColor || '#0F172A',
      }}
    >
      {/* Progress Bar */}
      <ProgressBar progress={progressPercent} primaryColor={theme.primaryColor} />

      {/* Brand Top Header */}
      <header className="p-6 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xs"
            style={{ backgroundColor: theme.primaryColor || '#6366F1' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {form.title}
          </span>
        </div>

        {typeof currentStep === 'number' && (
          <span className="text-xs font-medium text-slate-400">
            {currentStep + 1} of {questionsCount}
          </span>
        )}
      </header>

      {/* Main Dynamic Step Area */}
      <main className="flex-1 flex items-center justify-center py-10">
        <AnimatePresence mode="wait">
          {/* WELCOME */}
          {currentStep === 'welcome' && (
            <WelcomeStep
              key="welcome"
              welcomeScreen={form.welcome_screen}
              theme={theme}
              totalQuestions={questionsCount}
              onStart={handleNext}
            />
          )}

          {/* QUESTIONS */}
          {typeof currentStep === 'number' && form.questions[currentStep] && (
            <QuestionStep
              key={form.questions[currentStep].id}
              question={form.questions[currentStep]}
              index={currentStep}
              totalQuestions={questionsCount}
              value={answers[form.questions[currentStep].id]}
              onChange={(val) => {
                setAnswers((prev) => ({
                  ...prev,
                  [form.questions[currentStep as number].id]: val,
                }));
                if (validationError) setValidationError(null);
              }}
              onNext={handleNext}
              error={validationError}
              theme={theme}
              isSubmitting={isSubmitting}
            />
          )}

          {/* THANK YOU */}
          {currentStep === 'thank_you' && (
            <ThankYouStep
              key="thank_you"
              thankYouScreen={form.thank_you_screen}
              theme={theme}
              onRestart={() => {
                setAnswers({});
                setCurrentStep(form.welcome_screen?.enabled ? 'welcome' : 0);
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Floating Prev / Next Navigation Controls */}
      {currentStep !== 'thank_you' && (
        <NavigationControls
          canGoBack={currentStep !== 'welcome' && (currentStep !== 0 || !!form.welcome_screen?.enabled)}
          canGoForward={true}
          onPrev={handlePrev}
          onNext={handleNext}
          primaryColor={theme.primaryColor}
        />
      )}

      {/* Footer Branding */}
      <footer className="p-6 text-center text-xs text-slate-400 select-none">
        Powered by <strong className="font-semibold text-slate-700">FormFlow</strong>
      </footer>
    </div>
  );
}
