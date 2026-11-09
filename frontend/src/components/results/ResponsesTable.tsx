'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  Calendar,
} from 'lucide-react';
import { ResponseDetail } from '@/types/form';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface ResponsesTableProps {
  formId: number;
  responses: ResponseDetail[];
  onSelectResponse: (resp: ResponseDetail) => void;
  exportUrl: string;
}

export function ResponsesTable({
  formId,
  responses,
  onSelectResponse,
  exportUrl,
}: ResponsesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = responses.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const idMatch = String(r.id).includes(term);
    const respIdMatch = (r.respondent_id || '').toLowerCase().includes(term);
    const ansMatch = r.answers.some((a) =>
      String(a.answer_value || '').toLowerCase().includes(term)
    );
    return idMatch || respIdMatch || ansMatch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>

        <a href={exportUrl} download>
          <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />}>
            Export to CSV
          </Button>
        </a>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No responses match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4"># ID</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Respondent</th>
                  <th className="py-3 px-4">Key Answers</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((resp) => {
                  const firstTwoAnswers = resp.answers.slice(0, 2);
                  return (
                    <tr
                      key={resp.id}
                      onClick={() => onSelectResponse(resp)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">#{resp.id}</td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(resp.submitted_at)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {resp.respondent_id || 'Anonymous'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-500">
                        {firstTwoAnswers.map((a) => String(a.answer_value)).join(' • ') || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectResponse(resp);
                            }}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                            title="Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/forms/${formId}/responses/${resp.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Open Response Page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
