'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  CornerDownLeft,
  AlertCircle,
  Star,
  UploadCloud,
  FileText,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { PublicQuestion, ThemeConfig } from '@/types/form';
import { api } from '@/lib/api';

interface QuestionStepProps {
  question: PublicQuestion;
  index: number;
  totalQuestions: number;
  value: any;
  onChange: (val: any) => void;
  onNext: () => void;
  error?: string | null;
  theme: ThemeConfig;
  isSubmitting?: boolean;
}

export function QuestionStep({
  question,
  index,
  totalQuestions,
  value,
  onChange,
  onNext,
  error,
  theme,
  isSubmitting = false,
}: QuestionStepProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await api.uploadFile(file);
      onChange(res);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload PDF file.');
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-focus text/email/number inputs on question mount
  useEffect(() => {
    if (
      question.type === 'short_text' ||
      question.type === 'long_text' ||
      question.type === 'email' ||
      question.type === 'number'
    ) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [question.id, question.type]);

  const primaryColor = theme.primaryColor || '#6366F1';
  const textColor = theme.textColor || '#0F172A';

  const isLastQuestion = index === totalQuestions - 1;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-2xl w-full mx-auto px-6 text-left space-y-6"
    >
      {/* Header: Question Number & Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: primaryColor }}>
          <span>{index + 1}</span>
          <ArrowRight className="w-3.5 h-3.5" />
          {question.required && (
            <span className="text-rose-500 font-bold text-sm" title="Required">
              *
            </span>
          )}
        </div>

        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug"
          style={{ color: textColor }}
        >
          {question.title}
        </h2>

        {question.description && (
          <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
            {question.description}
          </p>
        )}
      </div>

      {/* Input Field Section */}
      <div className="pt-2">
        {/* SHORT TEXT */}
        {question.type === 'short_text' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder={question.settings?.placeholder || 'Type your answer here...'}
            className="w-full text-xl sm:text-2xl font-medium bg-transparent border-b-2 border-slate-300 focus:border-indigo-600 focus:outline-none py-2 text-slate-900 placeholder:text-slate-300 transition-colors"
          />
        )}

        {/* LONG TEXT */}
        {question.type === 'long_text' && (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder={question.settings?.placeholder || 'Type your answer here...'}
            className="w-full text-base sm:text-lg font-normal bg-transparent border-2 border-slate-200 rounded-2xl p-4 focus:border-indigo-600 focus:outline-none text-slate-900 placeholder:text-slate-300 transition-colors resize-none shadow-xs"
          />
        )}

        {/* EMAIL */}
        {question.type === 'email' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder={question.settings?.placeholder || 'name@example.com'}
            className="w-full text-xl sm:text-2xl font-medium bg-transparent border-b-2 border-slate-300 focus:border-indigo-600 focus:outline-none py-2 text-slate-900 placeholder:text-slate-300 transition-colors"
          />
        )}

        {/* NUMBER */}
        {question.type === 'number' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onNext();
              }
            }}
            placeholder={question.settings?.placeholder || '0'}
            className="w-full text-xl sm:text-2xl font-medium bg-transparent border-b-2 border-slate-300 focus:border-indigo-600 focus:outline-none py-2 text-slate-900 placeholder:text-slate-300 transition-colors"
          />
        )}

        {/* MULTIPLE CHOICE */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2.5 max-w-xl">
            {(question.settings?.options || []).map((opt: string, optIdx: number) => {
              const isSelected = value === opt;
              const letter = String.fromCharCode(65 + optIdx);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    // auto advance with smooth delay
                    setTimeout(() => onNext(), 200);
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left font-medium text-base transition-all select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-indigo-600 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        )}

        {/* DROPDOWN */}
        {question.type === 'dropdown' && (
          <div className="max-w-md">
            <select
              value={value || ''}
              onChange={(e) => {
                onChange(e.target.value);
                if (e.target.value) setTimeout(() => onNext(), 200);
              }}
              className="w-full px-4 py-3 text-base rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:border-indigo-600 font-medium text-slate-800 shadow-xs"
            >
              <option value="">Select an option...</option>
              {(question.settings?.options || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* YES / NO */}
        {question.type === 'yes_no' && (
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {['Yes', 'No'].map((choice, i) => {
              const isSelected = value === choice;
              const letter = i === 0 ? 'Y' : 'N';
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => {
                    onChange(choice);
                    setTimeout(() => onNext(), 200);
                  }}
                  className={`p-5 rounded-2xl border-2 font-bold text-center text-lg transition-all select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-800'
                  }`}
                >
                  <span className="block text-xs font-bold text-slate-400 mb-1">{letter}</span>
                  {choice}
                </button>
              );
            })}
          </div>
        )}

        {/* RATING */}
        {question.type === 'rating' && (
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              {Array.from({ length: question.settings?.scale || 5 }, (_, i) => i + 1).map(
                (num) => {
                  const isSelected = Number(value) === num;
                  const isHovered = (ratingHover || 0) >= num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onMouseEnter={() => setRatingHover(num)}
                      onMouseLeave={() => setRatingHover(null)}
                      onClick={() => {
                        onChange(num);
                        setTimeout(() => onNext(), 200);
                      }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                          : isHovered
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  );
                }
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
              <span>{question.settings?.minLabel || 'Min'}</span>
              <span>{question.settings?.maxLabel || 'Max'}</span>
            </div>
          </div>
        )}

        {/* FILE / PDF RESUME UPLOAD */}
        {question.type === 'file_upload' && (
          <div className="space-y-3 max-w-lg">
            <input
              ref={fileInputRef}
              type="file"
              accept={question.settings?.accept || '.pdf'}
              onChange={handleFileChange}
              className="hidden"
            />

            {!value?.url ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 text-center cursor-pointer transition-all space-y-3 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                    {isUploading ? 'Uploading file...' : 'Choose PDF file or drag & drop'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {question.settings?.placeholder || 'PDF Resume / CV (up to 15 MB)'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 text-xs font-semibold transition"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {value.filename || 'Uploaded Resume.pdf'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 mt-0.5">
                      <span>{value.size_formatted || 'PDF File'}</span>
                      <span>•</span>
                      <span className="font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`http://127.0.0.1:8000${value.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white border border-slate-200 transition"
                    title="View uploaded PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white border border-slate-200 transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Validation Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold max-w-md"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue / Submit Button Bar */}
      <div className="pt-4 flex items-center gap-3">
        <button
          onClick={onNext}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98] inline-flex items-center gap-2 text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <span>{isLastQuestion ? 'Submit' : 'OK'}</span>
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
          press <strong className="font-semibold text-slate-600">Enter ↵</strong>
        </span>
      </div>
    </motion.div>
  );
}
