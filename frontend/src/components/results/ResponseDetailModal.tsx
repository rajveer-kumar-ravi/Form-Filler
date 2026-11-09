'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';
import { ResponseDetail } from '@/types/form';
import { formatDate } from '@/lib/utils';
import { Clock, User, CheckCircle2, FileText, Download, ExternalLink } from 'lucide-react';

interface ResponseDetailModalProps {
  response: ResponseDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResponseDetailModal({
  response,
  isOpen,
  onClose,
}: ResponseDetailModalProps) {
  if (!response) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Response #${response.id}`}
      description={`Submitted on ${formatDate(response.submitted_at)}`}
      maxWidth="lg"
    >
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {/* Meta Header */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {response.respondent_id || 'Anonymous'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {response.completion_status}
          </span>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          {response.answers.map((ans, idx) => (
            <div key={ans.id} className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                Question {idx + 1}
              </span>
              <p className="text-sm font-semibold text-slate-800">{ans.question_title}</p>
              <div className="pt-1">
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
                  <div className="flex flex-wrap gap-1">
                    {ans.answer_value.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium"
                      >
                        {String(item)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {String(ans.answer_value)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
