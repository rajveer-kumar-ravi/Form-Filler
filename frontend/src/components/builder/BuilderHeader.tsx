'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Check,
  ExternalLink,
  Eye,
  Sliders,
  BarChart3,
  Layers,
  Sparkles,
  Globe,
  Lock,
} from 'lucide-react';
import { Form } from '@/types/form';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { ShareModal } from '@/components/common/ShareModal';

interface BuilderHeaderProps {
  form: Form;
  onTitleChange: (newTitle: string) => void;
  onPublishToggle: () => Promise<void>;
  publishing: boolean;
  activeTab: 'builder' | 'results' | 'settings';
}

export function BuilderHeader({
  form,
  onTitleChange,
  onPublishToggle,
  publishing,
  activeTab,
}: BuilderHeaderProps) {
  const { success } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(form.title);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isPublished = form.status === 'published';

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleText.trim() && titleText !== form.title) {
      onTitleChange(titleText.trim());
    } else {
      setTitleText(form.title);
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/form/${form.share_id}`;
    navigator.clipboard.writeText(publicUrl);
    success('Public form URL copied to clipboard!');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Back & Editable Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur();
              }}
              autoFocus
              className="text-sm font-semibold text-slate-900 px-2 py-0.5 rounded border border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-xs sm:max-w-md"
            />
          ) : (
            <div
              onClick={() => {
                setTitleText(form.title);
                setIsEditingTitle(true);
              }}
              className="text-sm font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer px-2 py-0.5 rounded hover:bg-slate-100 transition max-w-xs sm:max-w-md truncate"
              title="Click to rename"
            >
              {form.title}
            </div>
          )}

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
        </div>
      </div>

      {/* Center: Navigation Tabs (Builder / Results / Settings) */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        <Link
          href={`/forms/${form.id}/builder`}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            activeTab === 'builder'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Builder
        </Link>
        <Link
          href={`/forms/${form.id}/results`}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            activeTab === 'results'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Results
        </Link>
        <Link
          href={`/forms/${form.id}/settings`}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Settings
        </Link>
      </div>

      {/* Right: Actions (Share, Preview, Publish) */}
      <div className="flex items-center gap-2">
        {isPublished && (
          <>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Share, QR Code & Embed"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={`/form/${form.share_id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Open Live</span>
            </a>
          </>
        )}

        <Button
          onClick={onPublishToggle}
          loading={publishing}
          size="sm"
          variant={isPublished ? 'outline' : 'primary'}
          icon={isPublished ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareId={form.share_id}
        formTitle={form.title}
      />
    </header>
  );
}
