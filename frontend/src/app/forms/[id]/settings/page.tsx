'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Form, ThemeConfig, ScreenConfig } from '@/types/form';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import { Button } from '@/components/common/Button';
import { DeleteConfirmModal } from '@/components/dashboard/DeleteConfirmModal';
import { useToast } from '@/components/common/Toast';
import {
  Globe,
  Lock,
  Copy,
  ExternalLink,
  Palette,
  Layout,
  AlertTriangle,
  Loader2,
  Check,
} from 'lucide-react';

export default function FormSettingsPage() {
  const params = useParams();
  const formId = Number(params.id);
  const router = useRouter();
  const { success, error } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Local form state for settings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeDesc, setWelcomeDesc] = useState('');
  const [welcomeBtn, setWelcomeBtn] = useState('');
  const [thankYouTitle, setThankYouTitle] = useState('');
  const [thankYouDesc, setThankYouDesc] = useState('');
  const [thankYouBtn, setThankYouBtn] = useState('');

  const colorPresets = [
    { label: 'Indigo', hex: '#6366F1' },
    { label: 'Purple', hex: '#8B5CF6' },
    { label: 'Blue', hex: '#2563EB' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Rose', hex: '#E11D48' },
    { label: 'Charcoal', hex: '#1E293B' },
  ];

  const loadForm = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getForm(formId);
      setForm(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPrimaryColor(data.theme_config?.primaryColor || '#6366F1');
      setBackgroundColor(data.theme_config?.backgroundColor || '#FFFFFF');
      setWelcomeTitle(data.welcome_screen?.title || '');
      setWelcomeDesc(data.welcome_screen?.description || '');
      setWelcomeBtn(data.welcome_screen?.buttonText || 'Start');
      setThankYouTitle(data.thank_you_screen?.title || '');
      setThankYouDesc(data.thank_you_screen?.description || '');
      setThankYouBtn(data.thank_you_screen?.buttonText || 'Submit another');
    } catch (err) {
      error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, [formId, error]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    try {
      const updated = await api.updateForm(form.id, {
        title,
        description,
        theme_config: {
          ...form.theme_config,
          primaryColor,
          backgroundColor,
        },
        welcome_screen: {
          ...form.welcome_screen,
          title: welcomeTitle,
          description: welcomeDesc,
          buttonText: welcomeBtn,
        },
        thank_you_screen: {
          ...form.thank_you_screen,
          title: thankYouTitle,
          description: thankYouDesc,
          buttonText: thankYouBtn,
        },
      });
      setForm(updated);
      success('Form settings saved successfully!');
    } catch {
      error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!form) return;
    const url = `${window.location.origin}/form/${form.share_id}`;
    navigator.clipboard.writeText(url);
    success('Public link copied to clipboard!');
  };

  const handleDeleteForm = async (id: number) => {
    try {
      await api.deleteForm(id);
      success('Form deleted.');
      router.push('/dashboard');
    } catch {
      error('Failed to delete form.');
    }
  };

  if (loading || !form) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  const isPublished = form.status === 'published';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <BuilderHeader
        form={form}
        onTitleChange={setTitle}
        onPublishToggle={async () => {
          const res = isPublished
            ? await api.unpublishForm(form.id)
            : await api.publishForm(form.id);
          setForm(res);
          success(isPublished ? 'Form unpublished.' : 'Form published!');
        }}
        publishing={false}
        activeTab="settings"
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Form Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage sharing links, theme styling, welcome screens, and form status.
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Public Access & Sharing
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPublished ? 'Accepting Responses' : 'Draft / Paused'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {isPublished
              ? 'Your form is published and actively accepting responses from anyone with the link.'
              : 'Your form is currently in draft mode. Publish it to allow respondents to submit answers.'}
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/form/${form.share_id}` : ''}
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 select-all focus:outline-none"
            />
            <Button
              size="sm"
              variant="outline"
              icon={<Copy className="w-3.5 h-3.5" />}
              onClick={handleCopyLink}
            >
              Copy
            </Button>
            {isPublished && (
              <a
                href={`/form/${form.share_id}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Main Settings Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">General Information</h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Form Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Theme & Styling */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              Theme & Colors
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Primary Brand Color
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setPrimaryColor(preset.hex)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-medium"
                  >
                    <span
                      className="w-5 h-5 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {primaryColor === preset.hex && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Screens Customization */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-600" />
              Welcome & Thank You Screens
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Welcome Screen
                </span>
                <input
                  type="text"
                  placeholder="Welcome title"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <textarea
                  rows={2}
                  placeholder="Welcome description"
                  value={welcomeDesc}
                  onChange={(e) => setWelcomeDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Button label"
                  value={welcomeBtn}
                  onChange={(e) => setWelcomeBtn(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Thank You Screen
                </span>
                <input
                  type="text"
                  placeholder="Thank you title"
                  value={thankYouTitle}
                  onChange={(e) => setThankYouTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <textarea
                  rows={2}
                  placeholder="Thank you description"
                  value={thankYouDesc}
                  onChange={(e) => setThankYouDesc(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Button label"
                  value={thankYouBtn}
                  onChange={(e) => setThankYouBtn(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save All Changes
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 space-y-3">
          <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Danger Zone
          </h2>
          <p className="text-xs text-rose-700">
            Deleting this form will permanently remove all questions and response submissions.
          </p>
          <div className="pt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Form Permanently
            </Button>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        form={form ? { ...form, response_count: 0, question_count: form.questions.length } : null}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteForm}
      />
    </div>
  );
}
