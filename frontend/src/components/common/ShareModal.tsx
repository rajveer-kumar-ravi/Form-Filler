'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import {
  Copy,
  Check,
  QrCode,
  Code,
  Share2,
  ExternalLink,
  Download,
  MessageCircle,
  Mail,
  Smartphone,
  Globe,
  Send,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareId: string;
  formTitle: string;
}

export function ShareModal({ isOpen, onClose, shareId, formTitle }: ShareModalProps) {
  const { success } = useToast();
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed' | 'social'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedType, setEmbedType] = useState<'standard' | 'popup'>('standard');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const shareUrl = `${origin}/form/${shareId}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    shareUrl
  )}&margin=10`;

  const standardEmbedCode = `<iframe
  src="${shareUrl}"
  width="100%"
  height="700"
  frameborder="0"
  style="border: none; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);"
  allow="camera; microphone; autoplay; encrypted-media;"
></iframe>`;

  const popupEmbedCode = `<button
  onclick="window.open('${shareUrl}', 'FormFlow', 'width=800,height=800,scrollbars=yes')"
  style="background: #6366F1; color: white; padding: 12px 24px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 14px;"
>
  Open ${formTitle || 'Form'}
</button>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    success('Public form URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    success('Embed HTML snippet copied to clipboard!');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
      url: `https://wa.me/?text=${encodeURIComponent(`Please fill out this form: ${formTitle}\n${shareUrl}`)}`,
      bg: 'hover:bg-emerald-50 hover:border-emerald-200',
    },
    {
      name: 'Twitter (X)',
      icon: <Send className="w-5 h-5 text-sky-500" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Fill out: ${formTitle}`)}&url=${encodeURIComponent(shareUrl)}`,
      bg: 'hover:bg-sky-50 hover:border-sky-200',
    },
    {
      name: 'LinkedIn',
      icon: <Globe className="w-5 h-5 text-blue-600" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      bg: 'hover:bg-blue-50 hover:border-blue-200',
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5 text-indigo-600" />,
      url: `mailto:?subject=${encodeURIComponent(`Form: ${formTitle}`)}&body=${encodeURIComponent(`Hello,\n\nPlease complete this form:\n${shareUrl}\n\nThank you!`)}`,
      bg: 'hover:bg-indigo-50 hover:border-indigo-200',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share & Embed Form" maxWidth="xl">
      <div className="space-y-6 pt-2">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          {[
            { id: 'link', label: 'Direct Link', icon: <Share2 className="w-4 h-4" /> },
            { id: 'qr', label: 'QR Code', icon: <QrCode className="w-4 h-4" /> },
            { id: 'embed', label: 'Embed on Website', icon: <Code className="w-4 h-4" /> },
            { id: 'social', label: 'Social Share', icon: <Smartphone className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DIRECT LINK */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Public Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-700 select-all focus:outline-none"
                />
                <Button
                  onClick={handleCopyLink}
                  variant={copiedLink ? 'outline' : 'primary'}
                  size="sm"
                  className="gap-2 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-indigo-950">Test Respondent Experience</p>
                <p className="text-[11px] text-indigo-700">Open in a new tab to test as an anonymous respondent.</p>
              </div>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
              >
                <span>Open Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: QR CODE GENERATOR */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center space-y-4 py-2">
            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="Form QR Code"
                width={200}
                height={200}
                className="rounded-xl shadow-xs"
              />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-800">Scan with your smartphone camera</p>
              <p className="text-[11px] text-slate-400">Perfect for print flyers, presentations, event booths, or posters.</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={qrImageUrl}
                download={`${shareId}-qrcode.png`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download QR Code Image
              </a>
              <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-1.5">
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: EMBED CODES */}
        {activeTab === 'embed' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEmbedType('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  embedType === 'standard'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Full-Page iFrame Embed
              </button>
              <button
                type="button"
                onClick={() => setEmbedType('popup')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  embedType === 'popup'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Popup Modal Button
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={6}
                value={embedType === 'standard' ? standardEmbedCode : popupEmbedCode}
                className="w-full p-3.5 text-[11px] font-mono bg-slate-900 text-emerald-400 rounded-xl focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={() =>
                  handleCopyEmbed(embedType === 'standard' ? standardEmbedCode : popupEmbedCode)
                }
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition backdrop-blur-xs"
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEmbed ? 'Copied' : 'Copy HTML'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Paste this HTML snippet anywhere into your website, WordPress, Webflow, Shopify, or React application.
            </p>
          </div>
        )}

        {/* TAB 4: SOCIAL MEDIA SHARE */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Share your form with 1-click across messaging and social networks:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 transition shadow-2xs ${item.bg}`}
                >
                  <div className="p-2 rounded-xl bg-slate-50">{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Share with audience</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
