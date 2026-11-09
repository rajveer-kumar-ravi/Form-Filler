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
} from 'lucide-react';
import { FormAnalytics, QuestionAnalytics } from '@/types/form';
import { formatDate } from '@/lib/utils';

interface SummaryAnalyticsProps {
  analytics: FormAnalytics;
}

export function SummaryAnalytics({ analytics }: SummaryAnalyticsProps) {
  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Responses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Responses
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {analytics.total_responses}
            </h3>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completion Rate
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {analytics.completion_rate}%
            </h3>
          </div>
        </div>

        {/* Last Submission */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Latest Submission
            </p>
            <h3 className="text-sm font-semibold text-slate-900 mt-1 truncate max-w-[180px]">
              {analytics.last_response_at
                ? formatDate(analytics.last_response_at)
                : 'No submissions yet'}
            </h3>
          </div>
        </div>
      </div>

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

            {/* Short Text, Long Text, Email */}
            {q.recent_answers && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Collected Responses:
                </p>
                {q.recent_answers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No answers submitted yet.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {q.recent_answers.map((ans, aIdx) => (
                      <div
                        key={aIdx}
                        className="p-2.5 rounded-lg bg-slate-50 text-xs font-medium text-slate-700 border border-slate-100"
                      >
                        {ans}
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
