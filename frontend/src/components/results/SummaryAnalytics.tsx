'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Star,
  Hash,
  AlignLeft,
  UserX,
  Hourglass,
  Calendar,
  FileUp,
} from 'lucide-react';
import { FormAnalytics, QuestionAnalytics } from '@/types/form';
import { formatDate } from '@/lib/utils';

interface SummaryAnalyticsProps {
  analytics: FormAnalytics;
}

export function SummaryAnalytics({ analytics }: SummaryAnalyticsProps) {
  const formatSeconds = (sec?: number) => {
    if (!sec || sec <= 0) return '< 1 min';
    const mins = Math.floor(sec / 60);
    const remainingSecs = Math.round(sec % 60);
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  const completed = analytics.completed_responses ?? analytics.total_responses;
  const partial = analytics.partial_responses ?? 0;
  const abandonment = analytics.abandonment_rate ?? (analytics.total_responses > 0 ? Math.round((partial / analytics.total_responses) * 100) : 0);
  const avgTime = analytics.average_completion_time_seconds ?? 0;
  const trends = analytics.response_trends || [];

  const maxTrendCount = Math.max(1, ...trends.map((t) => t.count));

  return (
    <div className="space-y-8">
      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Responses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-3">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Started</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics.total_responses}</h3>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{completed}</h3>
        </div>

        {/* Partial */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3">
            <Hourglass className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In Progress</p>
          <h3 className="text-2xl font-black text-amber-600 mt-0.5">{partial}</h3>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completion %</p>
          <h3 className="text-2xl font-black text-slate-900 mt-0.5">{analytics.completion_rate}%</h3>
        </div>

        {/* Abandonment Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-3">
            <UserX className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Drop-off %</p>
          <h3 className="text-2xl font-black text-rose-600 mt-0.5">{abandonment}%</h3>
        </div>

        {/* Avg Completion Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Duration</p>
          <h3 className="text-xl font-black text-slate-900 mt-1">{formatSeconds(avgTime)}</h3>
        </div>
      </div>

      {/* Response Trends Over Time */}
      {trends.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Submission Activity (Last 14 Days)</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Daily Responses</span>
          </div>

          <div className="h-32 flex items-end gap-2 pt-4 px-2">
            {trends.map((t, idx) => {
              const heightPercent = Math.max(8, Math.round((t.count / maxTrendCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute -top-8 bg-slate-900 text-white text-[10px] font-semibold py-0.5 px-2 rounded whitespace-nowrap z-10">
                    {t.date}: {t.count} submissions
                  </div>
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      t.count > 0 ? 'bg-indigo-600 group-hover:bg-indigo-500' : 'bg-slate-100'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  {/* Label */}
                  <span className="text-[9px] text-slate-400 truncate max-w-[32px]">
                    {t.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Breakdown List */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          Question Breakdown ({analytics.questions.length})
        </h3>

        {analytics.questions.map((q: QuestionAnalytics, idx: number) => (
          <div
            key={q.question_id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 mb-1 block">
                  Question {idx + 1} • {q.type.replace('_', ' ')}
                </span>
                <h4 className="text-base font-bold text-slate-900">{q.title}</h4>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {q.total_answers} answers
              </span>
            </div>

            {/* Content by Type */}
            {/* Multiple Choice, Dropdown, Yes/No */}
            {q.breakdown && q.breakdown.length > 0 && (
              <div className="space-y-3 pt-2">
                {q.breakdown.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800">{item.label}</span>
                      <span className="text-slate-500 font-semibold">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rating / Number */}
            {(q.type === 'rating' || q.type === 'number') && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Average</p>
                  <p className="text-xl font-extrabold text-indigo-600 mt-0.5">
                    {q.average !== null ? q.average : '—'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Min</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {q.min !== null ? q.min : '—'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Max</p>
                  <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {q.max !== null ? q.max : '—'}
                  </p>
                </div>
              </div>
            )}

            {/* Short Text, Long Text, Email, File Upload */}
            {(q.type === 'short_text' || q.type === 'long_text' || q.type === 'email' || q.type === 'file_upload') && q.recent_answers && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {q.type === 'file_upload' ? 'Uploaded Files:' : 'Collected Responses:'}
                </p>
                {q.recent_answers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No answers submitted yet.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {q.recent_answers.map((ans, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-2.5 rounded-lg bg-slate-50 text-xs font-medium text-slate-700 border border-slate-100 flex items-center justify-between"
                      >
                        <span className="truncate">{ans}</span>
                        {q.type === 'file_upload' && (
                          <FileUp className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
