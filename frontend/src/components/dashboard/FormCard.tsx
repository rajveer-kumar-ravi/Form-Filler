'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MoreVertical,
  Edit3,
  BarChart3,
  ExternalLink,
  Copy,
  Trash2,
  FileCheck,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FormListItem } from '@/types/form';
import { formatRelativeTime } from '@/lib/utils';
import { useToast } from '@/components/common/Toast';

interface FormCardProps {
  form: FormListItem;
  onDuplicate: (id: number) => void;
  onDelete: (form: FormListItem) => void;
  onRename: (form: FormListItem) => void;
}

export function FormCard({ form, onDuplicate, onDelete, onRename }: FormCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { success } = useToast();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/form/${form.share_id}`;
    navigator.clipboard.writeText(url);
    success('Public share link copied to clipboard!');
    setMenuOpen(false);
  };

  const isPublished = form.status === 'published';

  return (
    <div className="relative group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full ${
          isPublished
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
            : 'bg-gradient-to-r from-slate-300 to-slate-400'
        }`}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isPublished ? 'Published' : 'Draft'}
            </span>

            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onRename(form);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDuplicate(form.id);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      Duplicate
                    </button>
                    {isPublished && (
                      <button
                        onClick={handleCopyLink}
                        className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                        Copy Share Link
                      </button>
                    )}
                    <div className="h-[1px] bg-slate-100 my-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(form);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form Title & Description */}
          <Link href={`/forms/${form.id}/builder`} className="block group-hover:text-indigo-600 transition">
            <h3 className="font-semibold text-slate-900 text-base line-clamp-1 leading-snug">
              {form.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2rem]">
              {form.description || 'No description provided.'}
            </p>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
              {form.response_count} responses
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {form.question_count} questions
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(form.updated_at)}
          </span>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-slate-50/70 border-t border-slate-100 px-5 py-2.5 flex items-center justify-between gap-2">
        <Link
          href={`/forms/${form.id}/builder`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition py-1"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Builder
        </Link>

        <div className="flex items-center gap-2">
          {isPublished && (
            <a
              href={`/form/${form.share_id}`}
              target="_blank"
              rel="noreferrer"
              title="View Public Form"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Link
            href={`/forms/${form.id}/results`}
            title="View Results"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
