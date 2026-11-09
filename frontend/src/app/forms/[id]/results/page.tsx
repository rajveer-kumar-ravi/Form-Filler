'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Form, FormAnalytics, ResponseDetail } from '@/types/form';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import { SummaryAnalytics } from '@/components/results/SummaryAnalytics';
import { ResponsesTable } from '@/components/results/ResponsesTable';
import { ResponseDetailModal } from '@/components/results/ResponseDetailModal';
import { useToast } from '@/components/common/Toast';
import { Loader2, BarChart3, ListFilter, Download } from 'lucide-react';

export default function FormResultsPage() {
  const params = useParams();
  const formId = Number(params.id);
  const { error, success } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'responses'>('summary');
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetail | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [formData, analyticsData, responsesData] = await Promise.all([
        api.getForm(formId),
        api.getFormAnalytics(formId),
        api.getFormResponses(formId),
      ]);
      setForm(formData);
      setAnalytics(analyticsData);
      setResponses(responsesData);
    } catch (err) {
      console.error(err);
      error('Failed to load results and analytics.');
    } finally {
      setLoading(false);
    }
  }, [formId, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !form) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading results & analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <BuilderHeader
        form={form}
        onTitleChange={async (newTitle) => {
          await api.updateForm(form.id, { title: newTitle });
          setForm((prev) => (prev ? { ...prev, title: newTitle } : null));
        }}
        onPublishToggle={async () => {
          const res =
            form.status === 'published'
              ? await api.unpublishForm(form.id)
              : await api.publishForm(form.id);
          setForm(res);
          success(
            form.status === 'published'
              ? 'Form unpublished.'
              : 'Form published!'
          );
        }}
        publishing={false}
        activeTab="results"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Results Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Form Results</h1>
            <p className="text-xs text-slate-500 mt-1">
              Review submission summaries, individual respondent answers, and completion metrics.
            </p>
          </div>

          {/* Sub-tab Switcher (Summary vs Responses) */}
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setActiveSubTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Summary
            </button>
            <button
              onClick={() => setActiveSubTab('responses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSubTab === 'responses'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Responses ({responses.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeSubTab === 'summary' && analytics && (
          <SummaryAnalytics analytics={analytics} />
        )}

        {activeSubTab === 'responses' && (
          <ResponsesTable
            formId={form.id}
            responses={responses}
            onSelectResponse={setSelectedResponse}
            exportUrl={api.getExportUrl(form.id)}
          />
        )}
      </main>

      {/* Response Detail Modal */}
      <ResponseDetailModal
        response={selectedResponse}
        isOpen={!!selectedResponse}
        onClose={() => setSelectedResponse(null)}
      />
    </div>
  );
}
