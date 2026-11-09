'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Plus, BookOpen, Compass } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onCreateClick?: () => void;
  onStartTour?: () => void;
}

export function Navbar({ onCreateClick, onStartTour }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group" data-tour="brand-logo">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-lg leading-none">
                FormFlow
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                Typeform Inspired
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === '/dashboard'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Forms
            </Link>

            <Link
              href="/guide"
              data-tour="guide-link"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                pathname === '/guide'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>User Guide (Hinglish)</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                Tutorial
              </span>
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition shadow-xs active:scale-95"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow" />
              <span>Start Guided Tour</span>
            </button>
          )}

          {onCreateClick ? (
            <Button
              onClick={onCreateClick}
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              data-tour="create-btn"
            >
              Create Form
            </Button>
          ) : (
            <Link href="/forms/new">
              <Button size="sm" icon={<Plus className="w-4 h-4" />} data-tour="create-btn">
                Create Form
              </Button>
            </Link>
          )}

          <div className="h-6 w-[1px] bg-slate-200 mx-1" />

          {/* User Avatar */}
          <div className="flex items-center gap-2 pl-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-medium text-xs flex items-center justify-center">
              RK
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Rajveer Kumar</p>
              <p className="text-[10px] text-slate-400">Creator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
