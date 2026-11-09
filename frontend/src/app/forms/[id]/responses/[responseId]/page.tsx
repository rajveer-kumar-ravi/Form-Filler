'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ResponseDetail, Form } from '@/types/form';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function SingleResponsePage() {
  const params = useParams();
  const formId = Number(params.id);
  const responseId = Number(params.responseId);
  const router = useRouter();

  const [form, setForm] = useState<Form | null>(null);
  const [response, setResponse] = useState<ResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [formData, responseData] = await Promise.all([
          api.getForm(formId),
          api.getResponseDetail(formId, responseId),
        ]);
        setForm(formData);
        setResponse(responseData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [formId, responseId]);

  if (loading || !response) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading response details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <Link
          href={`/forms/${formId}/results`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {/* Response Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {form?.title || 'Form'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {response.completion_status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Response #{response.id}
          </h1>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {response.respondent_id || 'Anonymous'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(response.submitted_at)}
            </span>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Answers ({response.answers.length})
          </h2>

          {response.answers.map((ans, idx) => (
            <div
              key={ans.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600">
                  Question {idx + 1}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {ans.question_type?.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-800">{ans.question_title}</h3>

              <div className="pt-2">
                {ans.answer_value === null || ans.answer_value === undefined ? (
                  <span className="text-xs text-slate-400 italic">No answer provided</span>
                ) : typeof ans.answer_value === 'object' && ans.answer_value?.url ? (
                  <a
                    href={`http://127.0.0.1:8000${ans.answer_value.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold transition"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>{ans.answer_value.filename || 'View Attached PDF Resume'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-rose-500 ml-1" />
                  </a>
                ) : Array.isArray(ans.answer_value) ? (
                  <div className="flex flex-wrap gap-1.5">
                    {ans.answer_value.map((item, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold"
                      >
                        {String(item)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium text-slate-900">
                    {String(ans.answer_value)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
