'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';
import { FormListItem } from '@/types/form';
import { api } from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/common/Button';
import { FormCard } from '@/components/dashboard/FormCard';
import { CreateFormModal } from '@/components/dashboard/CreateFormModal';
import { DeleteConfirmModal } from '@/components/dashboard/DeleteConfirmModal';
import { RenameModal } from '@/components/dashboard/RenameModal';
import { GuidedTour, TourStep } from '@/components/common/GuidedTour';
import { useToast } from '@/components/common/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<FormListItem | null>(null);
  const [formToRename, setFormToRename] = useState<FormListItem | null>(null);

  // Guided Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('tour=true')) {
      setIsTourOpen(true);
    }
  }, []);

  const dashboardTourSteps: TourStep[] = [
    {
      targetSelector: '[data-tour="create-btn"]',
      title: '1. Naya Form Banayein',
      content:
        'Yahan "Create Form" button par click karke aap naya Typeform-style form bana sakte hain. Aap blank canvas ya ready-made templates choose kar sakte hain.',
      position: 'bottom',
    },
    {
      targetSelector: '[data-tour="metrics-bar"]',
      title: '2. Live Summary Metrics',
      content:
        'Yahan aapko live overview milta hai ki aapke paas kitne total forms hain, kitne Published hain, aur kul milakar kitne logo ne respond kiya hai.',
      position: 'bottom',
    },
    {
      targetSelector: '[data-tour="search-bar"]',
      title: '3. Instant Form Search',
      content:
        'Agar aapke bohot saare surveys ya quizzes hain, toh bas yahan unka naam likhein. Real-time search se aapka form turant filter ho jayega.',
      position: 'bottom',
    },
    {
      targetSelector: '[data-tour="status-filter"]',
      title: '4. Status Filter Pills',
      content:
        'Aap "Published" (live forms) aur "Draft" (jo abhi live nahi hain) ke beech ek click me switch kar sakte hain.',
      position: 'bottom',
    },
    {
      targetSelector: '[data-tour="form-card"]',
      title: '5. Form Card & Action Menu',
      content:
        'Har form card par uska status badge, response counter, aur last updated time dikhta hai. "Edit Builder" par click karke form questions edit karein, ya chart icon par click karke responses dekhein!',
      position: 'top',
    },
    {
      targetSelector: '[data-tour="guide-link"]',
      title: '6. Visual Learning Guide',
      content:
        'Kabhi bhi pura interactive Hinglish tutorial padhna ho ya 10 practical lessons dekhne ho, toh navbar me "User Guide" par click karein!',
      position: 'bottom',
    },
  ];

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getForms(search, statusFilter === 'all' ? undefined : statusFilter);
      setForms(data);
    } catch (err: any) {
      console.error('Error fetching forms:', err);
      error('Failed to load forms. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, error]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleCreateForm = async (title: string, description: string, templateType?: string) => {
    try {
      const created = await api.createForm({ title, description });
      // If template chosen, add template questions
      if (templateType === 'feedback') {
        await api.createQuestion(created.id, {
          title: 'How satisfied are you with our service?',
          type: 'rating',
          position: 0,
          required: true,
          settings: { scale: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
        });
        await api.createQuestion(created.id, {
          title: 'What feature did you like the most?',
          type: 'short_text',
          position: 1,
          required: false,
        });
      } else if (templateType === 'lead') {
        await api.createQuestion(created.id, {
          title: 'What is your company or project name?',
          type: 'short_text',
          position: 0,
          required: true,
        });
        await api.createQuestion(created.id, {
          title: 'What is your work email address?',
          type: 'email',
          position: 1,
          required: true,
        });
        await api.createQuestion(created.id, {
          title: 'What is your estimated timeline?',
          type: 'multiple_choice',
          position: 2,
          required: true,
          settings: { options: ['Immediately', 'Within 1 month', '1-3 months', 'Exploring'] },
        });
      }

      success('Form created successfully!');
      router.push(`/forms/${created.id}/builder`);
    } catch (err) {
      error('Failed to create form.');
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const duplicated = await api.duplicateForm(id);
      success('Form duplicated successfully!');
      fetchForms();
    } catch (err) {
      error('Failed to duplicate form.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteForm(id);
      success('Form deleted successfully.');
      fetchForms();
    } catch (err) {
      error('Failed to delete form.');
    }
  };

  const handleRename = async (id: number, newTitle: string) => {
    try {
      await api.updateForm(id, { title: newTitle });
      success('Form renamed successfully.');
      fetchForms();
    } catch (err) {
      error('Failed to rename form.');
    }
  };

  // Stats calculation
  const totalResponses = forms.reduce((acc, f) => acc + (f.response_count || 0), 0);
  const publishedCount = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Navbar
        onCreateClick={() => setIsCreateModalOpen(true)}
        onStartTour={() => setIsTourOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header / Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Forms & Workflows
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, organize, and monitor high-converting conversational forms.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3" data-tour="metrics-bar">
            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                {forms.length}
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Total Forms
                </p>
                <p className="text-xs font-semibold text-slate-800">{publishedCount} published</p>
              </div>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                {totalResponses}
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Submissions
                </p>
                <p className="text-xs font-semibold text-slate-800">All forms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          {/* Search Box */}
          <div className="relative w-full sm:w-80" data-tour="search-bar">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 shadow-sm"
            />
          </div>

          {/* Filter Pills */}
          <div
            className="flex items-center gap-1.5 self-start sm:self-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm"
            data-tour="status-filter"
          >
            {(['all', 'published', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === filter
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-8 bg-slate-100 rounded mt-6" />
              </div>
            ))}
          </div>
        ) : forms.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No forms found</h3>
            <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'No forms matched your search or filter criteria. Try clearing them.'
                : 'Get started by creating your very first conversational Typeform experience.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {(search || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create New Form
              </Button>
            </div>
          </div>
        ) : (
          /* Forms Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form, idx) => (
              <div key={form.id} data-tour={idx === 0 ? 'form-card' : undefined}>
                <FormCard
                  form={form}
                  onDuplicate={handleDuplicate}
                  onDelete={setFormToDelete}
                  onRename={setFormToRename}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Interactive Guided Tour */}
      <GuidedTour
        steps={dashboardTourSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => success('Tour complete! Ab aap FormFlow ke pro hain.')}
      />

      {/* Modals */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateForm}
      />
      <DeleteConfirmModal
        form={formToDelete}
        isOpen={!!formToDelete}
        onClose={() => setFormToDelete(null)}
        onConfirm={handleDelete}
      />
      <RenameModal
        form={formToRename}
        isOpen={!!formToRename}
        onClose={() => setFormToRename(null)}
        onConfirm={handleRename}
      />
    </div>
  );
}
