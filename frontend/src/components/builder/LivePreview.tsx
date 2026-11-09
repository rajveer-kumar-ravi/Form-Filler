'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRight,
  Check,
  Star,
  CornerDownLeft,
  FileUp,
} from 'lucide-react';
import { Question, ScreenConfig, ThemeConfig } from '@/types/form';

interface LivePreviewProps {
  question: Question | null;
  welcomeScreen: ScreenConfig;
  thankYouScreen: ScreenConfig;
  selectedId: number | 'welcome' | 'thank_you' | null;
  currentIndex: number;
  totalQuestions: number;
  theme: ThemeConfig;
}

export function LivePreview({
  question,
  welcomeScreen,
  thankYouScreen,
  selectedId,
  currentIndex,
  totalQuestions,
  theme,
}: LivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [demoValue, setDemoValue] = useState<any>('');
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  return (
    <div className="w-[360px] lg:w-[440px] xl:w-[480px] bg-slate-100 border-l border-slate-200 flex flex-col h-full select-none">
      {/* Preview Top Header */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Live Preview
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1 rounded transition ${
              device === 'desktop' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-400'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1 rounded transition ${
              device === 'mobile' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-400'
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Device Simulation Area */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div
          className={`bg-white transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between ${
            device === 'mobile'
              ? 'w-[320px] h-[580px] rounded-[36px] border-[8px] border-slate-800 relative'
              : 'w-full h-full max-h-[580px] rounded-2xl border border-slate-200'
          }`}
          style={{
            backgroundColor: theme.backgroundColor || '#FFFFFF',
            color: theme.textColor || '#111827',
          }}
        >
          {/* Mobile Notch Bar */}
          {device === 'mobile' && (
            <div className="h-5 w-full flex items-center justify-center pt-1">
              <div className="w-20 h-3.5 bg-slate-800 rounded-full" />
            </div>
          )}

          {/* Progress Bar (if question mode) */}
          {selectedId !== 'welcome' && selectedId !== 'thank_you' && (
            <div className="w-full h-1 bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${Math.max(
                    15,
                    Math.round(((currentIndex + 1) / Math.max(1, totalQuestions)) * 100)
                  )}%`,
                  backgroundColor: theme.primaryColor || '#6366F1',
                }}
              />
            </div>
          )}

          {/* Screen Content */}
          <div className="flex-1 p-6 flex flex-col justify-center overflow-y-auto">
            {/* WELCOME SCREEN */}
            {selectedId === 'welcome' && (
              <div className="space-y-4 text-center my-auto">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  Welcome Screen
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug">
                  {welcomeScreen.title || 'Welcome to our form'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {welcomeScreen.description || 'Please answer the following questions.'}
                </p>
                <div className="pt-4">
                  <button
                    className="px-5 py-2.5 rounded-xl font-semibold text-white shadow-md transition hover:opacity-90 inline-flex items-center gap-2 text-sm"
                    style={{ backgroundColor: theme.primaryColor || '#6366F1' }}
                  >
                    {welcomeScreen.buttonText || 'Start'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* THANK YOU SCREEN */}
            {selectedId === 'thank_you' && (
              <div className="space-y-4 text-center my-auto">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {thankYouScreen.title || 'Thank you!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {thankYouScreen.description || 'Your response has been recorded.'}
                </p>
                <div className="pt-2">
                  <button
                    className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {thankYouScreen.buttonText || 'Submit another response'}
                  </button>
                </div>
              </div>
            )}

            {/* QUESTION SCREEN */}
            {selectedId !== 'welcome' && selectedId !== 'thank_you' && question && (
              <div className="space-y-5 my-auto">
                {/* Question Number & Title */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
                    <span>{currentIndex + 1}</span>
                    <ArrowRight className="w-3 h-3" />
                    {question.required && (
                      <span className="text-rose-500 text-xs font-bold">*</span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {question.title || 'Untitled question'}
                  </h3>
                  {question.description && (
                    <p className="text-xs text-slate-500 mt-1">{question.description}</p>
                  )}
                </div>

                {/* Input Controls Rendering */}
                <div>
                  {/* Short Text */}
                  {question.type === 'short_text' && (
                    <input
                      type="text"
                      placeholder={question.settings?.placeholder || 'Type your answer here...'}
                      value={demoValue}
                      onChange={(e) => setDemoValue(e.target.value)}
                      className="w-full border-b-2 border-indigo-500 focus:outline-none py-1.5 text-base font-medium text-slate-800 placeholder:text-slate-300 bg-transparent"
                    />
                  )}

                  {/* Long Text */}
                  {question.type === 'long_text' && (
                    <textarea
                      rows={3}
                      placeholder={question.settings?.placeholder || 'Type your answer here...'}
                      value={demoValue}
                      onChange={(e) => setDemoValue(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-300"
                    />
                  )}

                  {/* Multiple Choice */}
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {(question.settings?.options || ['Option 1', 'Option 2', 'Option 3']).map(
                        (opt: string, i: number) => {
                          const isSel = demoValue === opt;
                          return (
                            <div
                              key={i}
                              onClick={() => setDemoValue(opt)}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                                isSel
                                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSel && <Check className="w-4 h-4 text-indigo-600" />}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                  {/* Dropdown */}
                  {question.type === 'dropdown' && (
                    <select
                      value={demoValue}
                      onChange={(e) => setDemoValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                    >
                      <option value="">Select an option...</option>
                      {(question.settings?.options || []).map((opt: string, i: number) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Email */}
                  {question.type === 'email' && (
                    <input
                      type="email"
                      placeholder={question.settings?.placeholder || 'name@example.com'}
                      value={demoValue}
                      onChange={(e) => setDemoValue(e.target.value)}
                      className="w-full border-b-2 border-indigo-500 focus:outline-none py-1.5 text-base font-medium text-slate-800 placeholder:text-slate-300 bg-transparent"
                    />
                  )}

                  {/* Number */}
                  {question.type === 'number' && (
                    <input
                      type="number"
                      placeholder={question.settings?.placeholder || '0'}
                      value={demoValue}
                      onChange={(e) => setDemoValue(e.target.value)}
                      className="w-full border-b-2 border-indigo-500 focus:outline-none py-1.5 text-base font-medium text-slate-800 placeholder:text-slate-300 bg-transparent"
                    />
                  )}

                  {/* Yes / No */}
                  {question.type === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-3">
                      {['Yes', 'No'].map((choice, i) => {
                        const isSel = demoValue === choice;
                        return (
                          <div
                            key={choice}
                            onClick={() => setDemoValue(choice)}
                            className={`p-3 rounded-xl border text-center font-semibold text-xs cursor-pointer transition ${
                              isSel
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            <span className="block text-[10px] text-slate-400 font-bold mb-0.5">
                              {i === 0 ? 'Y' : 'N'}
                            </span>
                            {choice}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rating */}
                  {question.type === 'rating' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        {Array.from({ length: question.settings?.scale || 5 }, (_, i) => i + 1).map(
                          (num) => {
                            const isSel = Number(demoValue) === num;
                            const isHov = (ratingHover || 0) >= num;
                            return (
                              <button
                                key={num}
                                type="button"
                                onMouseEnter={() => setRatingHover(num)}
                                onMouseLeave={() => setRatingHover(null)}
                                onClick={() => setDemoValue(num)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                                  isSel
                                    ? 'bg-indigo-600 text-white'
                                    : isHov
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {num}
                              </button>
                            );
                          }
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>{question.settings?.minLabel || 'Min'}</span>
                        <span>{question.settings?.maxLabel || 'Max'}</span>
                      </div>
                    </div>
                  )}

                  {/* File / PDF Resume Upload */}
                  {question.type === 'file_upload' && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {question.settings?.placeholder || 'Click or drag PDF resume here'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Accepts {question.settings?.accept || '.pdf'} (up to {question.settings?.maxSizeMB || 10} MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Continue button mock */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs inline-flex items-center gap-1.5"
                    style={{ backgroundColor: theme.primaryColor || '#6366F1' }}
                  >
                    <span>OK</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    press <strong className="font-semibold text-slate-600">Enter</strong>{' '}
                    <CornerDownLeft className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
