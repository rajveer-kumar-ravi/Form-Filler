'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Check, CheckCircle2, FileText, UserPlus, Star } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/common/Button';
import { api } from '@/lib/api';
import { useToast } from '@/components/common/Toast';

export default function NewFormPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('blank');
  const [loading, setLoading] = useState(false);

  const templates = [
    {
      id: 'blank',
      title: 'Blank Canvas',
      desc: 'Build your customized form question by question with full layout control.',
      icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
      badge: 'Popular',
    },
    {
      id: 'job',
      title: 'Job / Candidate Application',
      desc: 'Pre-populated with full name, email, phone, experience, and skills questions.',
      icon: <UserPlus className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'feedback',
      title: 'Customer Feedback Survey',
      desc: 'Optimized for CSAT & NPS scores with rating scales and recommendation choices.',
      icon: <Star className="w-5 h-5 text-amber-500" />,
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const created = await api.createForm({
        title: title.trim(),
        description: description.trim(),
      });

      // Add template specific questions if chosen
      if (template === 'job') {
        await api.createQuestion(created.id, {
          title: 'What is your full name?',
          type: 'short_text',
          position: 0,
          required: true,
        });
        await api.createQuestion(created.id, {
          title: 'What is your email address?',
          type: 'email',
          position: 1,
          required: true,
        });
        await api.createQuestion(created.id, {
          title: 'Years of professional experience?',
          type: 'multiple_choice',
          position: 2,
          required: true,
          settings: { options: ['0-1 years', '2-4 years', '5+ years'] },
        });
      } else if (template === 'feedback') {
        await api.createQuestion(created.id, {
          title: 'How would you rate your overall experience?',
          type: 'rating',
          position: 0,
          required: true,
          settings: { scale: 5, minLabel: 'Poor', maxLabel: 'Loved it' },
        });
        await api.createQuestion(created.id, {
          title: 'Would you recommend us to a friend?',
          type: 'yes_no',
          position: 1,
          required: true,
        });
        await api.createQuestion(created.id, {
          title: 'What could we do better?',
          type: 'long_text',
          position: 2,
          required: false,
        });
      }

      success('Form created! Opening builder...');
      router.push(`/forms/${created.id}/builder`);
    } catch (err) {
      error('Failed to create form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create a New Form</h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose a starting point or design a tailored flow from scratch.
          </p>
        </div>

        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Form Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Quarterly Client Satisfaction Survey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or instructions for your respondents"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Select Starting Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tpl) => {
                const isSelected = template === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setTemplate(tpl.id)}
                    className={`relative p-4 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center">
                          {tpl.icon}
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <p className="font-semibold text-sm text-slate-900">{tpl.title}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} disabled={!title.trim()}>
              Continue to Builder
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
