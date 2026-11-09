'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, templateType?: string) => Promise<void>;
}

export function CreateFormModal({ isOpen, onClose, onSubmit }: CreateFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit(title.trim(), description.trim(), selectedTemplate);
      setTitle('');
      setDescription('');
      setSelectedTemplate('blank');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    {
      id: 'blank',
      title: 'Start from scratch',
      desc: 'Build your custom form with complete freedom',
    },
    {
      id: 'feedback',
      title: 'Customer Feedback',
      desc: 'Pre-loaded with rating, multiple choice & review questions',
    },
    {
      id: 'lead',
      title: 'Lead Generation',
      desc: 'Capture contacts, emails, project scopes and timelines',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Form"
      description="Design a beautiful conversational form in minutes."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Form Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Product Feedback Survey"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder:text-slate-400"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="A brief explanation of why respondents should fill this out"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Choose a starting point
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-left relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold text-xs text-slate-900">{tpl.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">{tpl.desc}</p>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading} disabled={!title.trim()}>
            Create & Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
}
