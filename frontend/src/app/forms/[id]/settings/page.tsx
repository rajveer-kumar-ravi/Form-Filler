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
  Share2,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { ShareModal } from '@/components/common/ShareModal';

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
  const [textColor, setTextColor] = useState('#1E293B');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [borderRadius, setBorderRadius] = useState('rounded-2xl');
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeDesc, setWelcomeDesc] = useState('');
  const [welcomeBtn, setWelcomeBtn] = useState('');
  const [thankYouTitle, setThankYouTitle] = useState('');
  const [thankYouDesc, setThankYouDesc] = useState('');
  const [thankYouBtn, setThankYouBtn] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const themePresets = [
    {
      name: 'Typeform Violet',
      primary: '#6366F1',
      bg: '#FFFFFF',
      text: '#1E293B',
      radius: 'rounded-2xl',
      font: 'Inter',
      desc: 'Clean & modern SaaS',
    },
    {
      name: 'Midnight Dark',
      primary: '#10B981',
      bg: '#0F172A',
      text: '#F8FAFC',
      radius: 'rounded-2xl',
      font: 'Inter',
      desc: 'Emerald on dark slate',
    },
    {
      name: 'Sunset Rose',
      primary: '#F43F5E',
      bg: '#FFF1F2',
      text: '#881337',
      radius: 'rounded-3xl',
      font: 'Poppins',
      desc: 'Warm & welcoming blush',
    },
    {
      name: 'Nordic Forest',
      primary: '#0D9488',
      bg: '#F0FDFA',
      text: '#134E4A',
      radius: 'rounded-xl',
      font: 'Roboto',
      desc: 'Fresh mint & teal vibe',
    },
    {
      name: 'Electric Amber',
      primary: '#D97706',
      bg: '#FFFBEB',
      text: '#78350F',
      radius: 'rounded-2xl',
      font: 'Inter',
      desc: 'Vibrant golden cream',
    },
    {
      name: 'Minimal Mono',
      primary: '#18181B',
      bg: '#FAFAFA',
      text: '#09090B',
      radius: 'rounded-lg',
      font: 'Inter',
      desc: 'High-end editorial clean',
    },
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
      setTextColor(data.theme_config?.textColor || '#1E293B');
      setFontFamily(data.theme_config?.fontFamily || 'Inter');
      setBorderRadius(data.theme_config?.borderRadius || 'rounded-2xl');
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
          textColor,
          fontFamily,
          borderRadius,
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
            <Button
              type="button"
              size="sm"
              variant="primary"
              icon={<Share2 className="w-3.5 h-3.5" />}
              onClick={() => setIsShareModalOpen(true)}
            >
              Share, QR & Embed
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                Theme & Design Presets
              </h2>
              <span className="text-[11px] font-medium text-slate-400">
                Instantly transforms the respondent experience
              </span>
            </div>

            {/* 6 Theme Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                1-Click Design Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {themePresets.map((preset) => {
                  const isSelected =
                    primaryColor === preset.primary && backgroundColor === preset.bg;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setBackgroundColor(preset.bg);
                        setTextColor(preset.text);
                        setBorderRadius(preset.radius);
                        setFontFamily(preset.font);
                      }}
                      className={`p-3 rounded-xl border text-left transition relative ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.bg }}
                        />
                        {isSelected && (
                          <span className="ml-auto text-indigo-600">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Colors & Typography */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Primary Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Page Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Inter">Inter (Modern & Clean)</option>
                  <option value="Poppins">Poppins (Friendly & Rounded)</option>
                  <option value="Roboto">Roboto (Technical & Crisp)</option>
                  <option value="system-ui">System Sans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Card Border Radius
                </label>
                <select
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="rounded-lg">Slight (8px)</option>
                  <option value="rounded-2xl">Standard Rounded (16px)</option>
                  <option value="rounded-3xl">Pill Smooth (24px)</option>
                </select>
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

      {/* Share, QR Code & Embed Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareId={form.share_id}
        formTitle={form.title}
      />
    </div>
  );
}
