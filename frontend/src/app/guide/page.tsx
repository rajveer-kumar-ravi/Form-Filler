'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  Edit3,
  Globe,
  Share2,
  BarChart3,
  Download,
  HelpCircle,
  Eye,
  GripVertical,
  Sliders,
  Check,
  Compass,
  Star,
  ExternalLink,
  Smartphone,
  Monitor,
  MousePointer,
  RotateCcw,
} from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Button } from '@/components/common/Button';

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

export default function GuidePage() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [activeQuestionTab, setActiveQuestionTab] = useState<string>('short_text');

  // Exercise checklist state for Lesson 10
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
  });

  const toggleChecklistItem = (num: number) => {
    setChecklist((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const toggleLessonComplete = (lessonId: number) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const chapters: Chapter[] = [
    {
      id: 1,
      title: 'LESSON 1: Understanding Dashboard',
      subtitle: 'Dashboard ko samjhein aur navigate karein',
      icon: 'Layout',
    },
    {
      id: 2,
      title: 'LESSON 2: Creating Your First Form',
      subtitle: 'Naya form banana aur template chunna',
      icon: 'Plus',
    },
    {
      id: 3,
      title: 'LESSON 3: Understanding Form Builder',
      subtitle: '3-Panel layout aur controls',
      icon: 'Layers',
    },
    {
      id: 4,
      title: 'LESSON 4: Adding Questions (8 Types)',
      subtitle: 'Sabhi 8 question types ko detail me samjhein',
      icon: 'HelpCircle',
    },
    {
      id: 5,
      title: 'LESSON 5: Managing Questions',
      subtitle: 'Edit, Delete, Duplicate aur Drag-and-Drop',
      icon: 'Sliders',
    },
    {
      id: 6,
      title: 'LESSON 6: Live Preview',
      subtitle: 'Desktop aur Mobile frame me test karein',
      icon: 'Eye',
    },
    {
      id: 7,
      title: 'LESSON 7: Publishing Your Form',
      subtitle: 'Publish karna, link copy karna aur unpublish',
      icon: 'Globe',
    },
    {
      id: 8,
      title: 'LESSON 8: Filling Out a Form',
      subtitle: 'Conversational respondent experience',
      icon: 'MousePointer',
    },
    {
      id: 9,
      title: 'LESSON 9: Viewing Responses',
      subtitle: 'Analytics, individual answers aur CSV export',
      icon: 'BarChart3',
    },
    {
      id: 10,
      title: 'LESSON 10: Complete Practice Exercise',
      subtitle: 'End-to-End practical exercise step by step',
      icon: 'CheckCircle2',
    },
  ];

  const progressPercentage = Math.round((completedLessons.length / chapters.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Guide Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Product Trainer • Interactive Academy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              FormFlow Visual User Guide (Hinglish)
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Namaste! Main aapka personal product trainer hoon. Main aapko shuru se lekar aakhir tak
              sikhauंगा ki FormFlow ka har feature kaise kaam karta hai — bina kisi technical jargon ke!
            </p>
          </div>

          {/* Quick Progress Bar Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:w-72 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-300">Aapki Training Progress</span>
              <span className="text-indigo-400 font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {completedLessons.length} of {chapters.length} lessons completed
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar: Chapters List */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Syllabus
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                10 Lessons
              </span>
            </div>

            <nav className="space-y-1">
              {chapters.map((chap) => {
                const isActive = activeLesson === chap.id;
                const isDone = completedLessons.includes(chap.id);
                return (
                  <button
                    key={chap.id}
                    onClick={() => setActiveLesson(chap.id)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-950 shadow-xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : chap.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-indigo-900' : 'text-slate-800'
                        }`}
                      >
                        {chap.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {chap.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <Link
                href="/dashboard?tour=true"
                className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Compass className="w-4 h-4" />
                <span>Start Live Guided Tour</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area: Active Lesson Content */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs overflow-hidden">
          {/* ========================================================= */}
          {/* LESSON 1: UNDERSTANDING THE DASHBOARD */}
          {/* ========================================================= */}
          {activeLesson === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 1 • Orientation
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 1: Understanding the Dashboard
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Dashboard aapka home screen hai jahan aapke saare forms aur unka live status dikhta hai.
                </p>
              </div>

              {/* Real Screenshot with Annotations */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <Image
                    src="/guide/01-dashboard.png"
                    alt="FormFlow Dashboard"
                    width={1280}
                    height={820}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  {/* Badge Overlays */}
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Actual FormFlow Dashboard
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center">
                  Screenshot: Live FormFlow Dashboard showing existing seeded forms, metrics & quick actions.
                </p>
              </div>

              {/* Step by Step Hinglish Explanation */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  Dashboard ko kaise open karein?
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100 space-y-2">
                  <p>
                    Browser me <strong>http://localhost:3000/dashboard</strong> open karein ya top navbar me{' '}
                    <strong>&quot;My Forms&quot;</strong> par click karein. Aap turant is page par pahunch jayenge.
                  </p>
                </div>

                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  Har section ka matlab kya hai?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <span className="font-bold text-slate-900 block mb-1">
                      📊 Top Summary Metrics:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Yahan do boxes dikhte hain: <strong>Total Forms</strong> (aapke kul forms aur kitne published hain)
                      aur <strong>Submissions</strong> (sab forms par total kitne responses aaye hain).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <span className="font-bold text-slate-900 block mb-1">
                      🔍 Search & Filter Pills:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Search box me form ka naam type karke search kar sakte hain. Saath me <strong>All</strong>,{' '}
                      <strong>Published</strong>, aur <strong>Draft</strong> pills hain jinse forms filter hote hain.
                    </p>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  Draft vs Published me kya antar hai?
                </h3>
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-2 leading-relaxed">
                  <p>
                    🟢 <strong>Published:</strong> Iska matlab form live hai! Iska link kisi ke sath bhi share kiya ja sakta hai aur log answers submit kar sakte hain.
                  </p>
                  <p>
                    ⚪ <strong>Draft:</strong> Iska matlab form abhi ban raha hai ya paused hai. Agar koi draft form ka link kholega, toh use message aayega ki form responses accept nahi kar raha hai.
                  </p>
                </div>

                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  Form Card ke buttons kya karte hain?
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 font-bold rounded-md">
                      Edit Builder
                    </span>
                    <span className="text-slate-600">
                      Is par click karte hi aap Form Builder me pahunch jaoge jahan questions add aur edit kar sakte ho.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md">
                      BarChart Icon
                    </span>
                    <span className="text-slate-600">
                      Results page open karta hai jahan graphs, completion rate aur response tables dikhte hain.
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="px-2 py-1 bg-slate-200 text-slate-800 font-bold rounded-md">
                      Three Dots (•••)
                    </span>
                    <span className="text-slate-600">
                      Rename karne, form Duplicate (copy) karne, share link copy karne, aur Delete karne ka option deta hai.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 2: CREATING YOUR FIRST FORM */}
          {/* ========================================================= */}
          {activeLesson === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 2 • Form Creation
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 2: Creating Your First Form
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Step-by-step sikhein ki naya form kaise banaya jata hai aur templates kaise use karte hain.
                </p>
              </div>

              {/* Real Screenshot */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <Image
                    src="/guide/02-create-form.png"
                    alt="Create Form Screen"
                    width={1280}
                    height={820}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Form Creation Page (/forms/new)
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center">
                  Screenshot: Full-page form creation experience with template selection.
                </p>
              </div>

              {/* Step by Step Hinglish Explanation */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-2">
                  <p className="font-bold text-sm text-indigo-900">💡 Simple 3 Steps me Form Banayein:</p>
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>
                      Dashboard ya Navbar me <strong>&quot;Create Form&quot;</strong> button par click karein.
                    </li>
                    <li>
                      <strong>Form Title:</strong> Apne form ka naam likhein (Jaise: <em>&quot;Website Feedback Survey&quot;</em>).
                    </li>
                    <li>
                      <strong>Template Selection:</strong> Aap <em>Blank Canvas</em> (scratch se), <em>Job Application</em>, ya <em>Customer Feedback</em> me se koi bhi starting point choose kar sakte hain.
                    </li>
                    <li>
                      Neeche <strong>&quot;Continue to Builder&quot;</strong> button dabayein! Aapka form turant database me create ho jayega aur aap direct Builder page par pahunch jayenge.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 3: UNDERSTANDING THE FORM BUILDER */}
          {/* ========================================================= */}
          {activeLesson === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 3 • Form Builder Architecture
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 3: Understanding the Form Builder
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Form Builder ka 3-Panel professional layout aur har panel ki power ko samjhein.
                </p>
              </div>

              {/* Real Screenshot */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <Image
                    src="/guide/03-builder-overview.png"
                    alt="Form Builder 3-Panel Layout"
                    width={1360}
                    height={850}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    FormFlow 3-Panel Builder
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center">
                  Screenshot: Left panel (Steps & Questions), Center panel (Question Editor), Right panel (Live Preview).
                </p>
              </div>

              {/* Breakdown of 3 Panels */}
              <div className="space-y-4 pt-2 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">
                    1️⃣ LEFT PANEL: Steps Navigation &amp; Reordering
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Yahan aapke form ke saare steps line se dikhte hain. Sabse upar <strong>Welcome Screen</strong> card hota hai,
                    beech me saare <strong>Questions (1, 2, 3...)</strong> hote hain, aur end me <strong>Thank You Screen</strong> hoti hai.
                    Kisi bhi question par click karke use center editor me open kar sakte hain, aur grip handle se drag karke reorder kar sakte hain.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">
                    2️⃣ CENTER PANEL: Main Question Editor
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Yahan aap selected question ka title aur description likhte hain. Question ka type change kar sakte hain,
                    <strong>Required</strong> toggle on/off kar sakte hain, aur options ya rating scale adjust kar sakte hain.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">
                    3️⃣ RIGHT PANEL: Live Interactive Preview
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Aap jo bhi center panel me type karenge, wo turant right side me live preview me reflect hota hai!
                    Aap top right buttons se <strong>Desktop</strong> aur <strong>Mobile phone frame</strong> me switch karke test kar sakte hain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 4: ADDING QUESTIONS (ALL 8 TYPES) */}
          {/* ========================================================= */}
          {activeLesson === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 4 • Question Types Mastery
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 4: Adding Questions (All 8 Question Types)
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  FormFlow sabhi 9 popular Typeform question types (including File / PDF Resume) support karta hai. Neeche har type par click karke sikhein.
                </p>
              </div>

              {/* Interactive Question Types Switcher */}
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
                {[
                  { id: 'short_text', label: '1. Short Text' },
                  { id: 'long_text', label: '2. Long Text' },
                  { id: 'multiple_choice', label: '3. Multiple Choice' },
                  { id: 'dropdown', label: '4. Dropdown' },
                  { id: 'email', label: '5. Email' },
                  { id: 'number', label: '6. Number' },
                  { id: 'yes_no', label: '7. Yes / No' },
                  { id: 'rating', label: '8. Rating' },
                  { id: 'file_upload', label: '9. File / PDF Resume' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveQuestionTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeQuestionTab === item.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents for Each Question Type */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 text-xs">
                {activeQuestionTab === 'short_text' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      📝 Short Text Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Kahan click karein:</strong> Left sidebar me &quot;+ Add New Question&quot; dabayein aur &quot;Short Text&quot; select karein.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Kiske liye use hota hai:</strong> Naam, Company Name, Job Title, ya koi bhi 1-line answer lene ke liye.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Respondent kya dekhega:</strong> Respondent ko ek clean single-line input field dikhegi. Answer type karke jaise hi <strong>Enter</strong> dabayega, agla question aa jayega!
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'long_text' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      📄 Long Text Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Kiske liye use hota hai:</strong> Feedback, essays, project description, ya detailed answers ke liye.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Respondent experience:</strong> Multi-line box jisme multiple paragraphs likh sakte hain. Next question par jaane ke liye <strong>Cmd+Enter</strong> ya &quot;OK&quot; button dabaya jata hai.
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'multiple_choice' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      ☑️ Multiple Choice Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Options kaise banayein:</strong> Center panel me &quot;Add another option&quot; button dabakar options add karein. Har option ka naam edit kar sakte hain.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Respondent experience:</strong> Har option ke aage <strong>A, B, C, D</strong> cards ban kar aate hain. Respondent mouse se click kar sakta hai ya keyboard se direct <strong>&quot;A&quot; ya &quot;B&quot; key</strong> press karke select kar sakta hai!
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'dropdown' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      🔽 Dropdown Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Kiske liye use hota hai:</strong> Country select, City, State, ya jab options bohot saare ho (10+ options).
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Respondent experience:</strong> Compact select menu open hota hai aur option choose karte hi auto-advance ho jata hai.
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'email' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      ✉️ Email Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Automatic Validation:</strong> FormFlow check karta hai ki user ne sahi email format (e.g. <em>name@domain.com</em>) likha hai ya nahi.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Agar koi galat email likh kar Enter dabayega, toh screen par red validation message aayega: <em>&quot;Please enter a valid email address.&quot;</em>
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'number' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      🔢 Number Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Min &amp; Max Range:</strong> Aap center panel me Minimum value (e.g. 18) aur Maximum value (e.g. 100) set kar sakte hain.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Respondent isme alphabets type nahi kar sakta, sirf numbers valid hote hain.
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'yes_no' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      🔘 Yes / No Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Quick Binary Choice:</strong> Respondent ko do bade attractive cards dikhte hain: <strong>Yes (Y)</strong> aur <strong>No (N)</strong>.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Respondent bina mouse chhue keyboard se sirf <strong>&quot;Y&quot;</strong> ya <strong>&quot;N&quot;</strong> press karke instant answer kar sakta hai!
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'rating' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      ⭐ Rating Scale Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Scale &amp; Labels:</strong> Center panel me aap rating scale chun sakte hain (1 to 5, 1 to 7, ya 1 to 10). Saath me Min label (e.g. <em>&quot;Poor&quot;</em>) aur Max label (e.g. <em>&quot;Loved it&quot;</em>) configure kar sakte hain.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Keyboard shortcuts:</strong> Respondent keyboard par number key <strong>1, 2, 3, 4, 5</strong> press karke direct rate kar sakta hai!
                    </p>
                  </div>
                )}

                {activeQuestionTab === 'file_upload' && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      📎 File / PDF Resume Question
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Kahan click karein:</strong> Left sidebar me <strong>&quot;+ Add Question&quot;</strong> dabayein aur 9th card <strong>&quot;File / PDF Resume&quot;</strong> par click karein.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Configuration:</strong> Center panel me aap <em>Accepted formats</em> (.pdf, .doc, .docx) aur <em>Max File Size</em> (15 MB tak) configure kar sakte hain.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Respondent experience:</strong> Ek modern drag &amp; drop zone dikhega jisme candidate apna resume/file drag karke drop kar sakta hai ya <em>&quot;Browse Files&quot;</em> button dabakar select kar sakta hai. File upload hote hi real-time progress bar aur green checkmark aata hai.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Admin / Results me kya dikhega:</strong> Results dashboard aur individual response drawer me candidate ka uploaded PDF file ka direct link milta hai, jahan se aap 1-click me resume preview ya download kar sakte hain!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 5: MANAGING QUESTIONS */}
          {/* ========================================================= */}
          {activeLesson === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 5 • Question Management
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 5: Managing Questions
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Questions ko edit karna, delete karna, duplicate karna, aur drag-and-drop se sequence badalna.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-slate-900 text-sm block">
                    ✨ Drag and Drop se Question Reorder Kaise Karein?
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    1. Left sidebar me kisi bhi question card ke left side par <strong>Grip Handle (`⋮⋮`)</strong> par mouse le jayein.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    2. Mouse click karke pakad kar upar ya neeche drag karein.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    3. Jaise hi aap drop karenge, order turant update ho jayega aur backend API par save ho jayega.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <span className="font-bold text-slate-900 block">🔁 Duplicate Question:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Left sidebar me question par hover karne par copy icon (`⧉`) dikhta hai. Click karte hi saare options aur settings ke saath question ki instant copy ban jati hai.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <span className="font-bold text-slate-900 block">🗑 Delete Question:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Question par hover karke trash icon (`🗑`) dabane se question delete ho jata hai aur baaki questions ke sequence numbers (1, 2, 3...) auto-adjust ho jate hain.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <span className="font-bold text-slate-900 block">⭐ Required Toggle:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Center panel me top-right par <strong>Required</strong> checkbox hai. Isko check karne par question ke aage red asterisk (*) lag jata hai aur respondent bina answer diye aage nahi badh sakta.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <span className="font-bold text-slate-900 block">💬 Description / Help Text:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Question title ke neeche &quot;Help Text&quot; field me aap instructions likh sakte hain (e.g. <em>&quot;Including country code&quot;</em>).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 6: LIVE PREVIEW */}
          {/* ========================================================= */}
          {activeLesson === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 6 • Quality Assurance
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 6: Live Preview
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Bina form publish kiye check karein ki respondent ko form kaisa dikhega.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-indigo-600 text-sm block">
                    📱 Desktop vs Mobile Simulator Switcher:
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Form Builder ke right panel me top-right corner par do icons hain:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                    <li>
                      <strong>Monitor Icon:</strong> Full desktop view preview karta hai.
                    </li>
                    <li>
                      <strong>Smartphone Icon:</strong> iPhone style mobile frame preview karta hai taaki aap verify kar sakein ki mobile users ke liye text aur buttons perfect fit hain ya nahi.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-emerald-900">⚡ Interactive Testing:</p>
                  <p>
                    Live preview sirf picture nahi hai — aap preview ke andar sach me choices click kar sakte hain, rating select kar sakte hain, aur input me type karke flow test kar sakte hain!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 7: PUBLISHING YOUR FORM */}
          {/* ========================================================= */}
          {activeLesson === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 7 • Going Live
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 7: Publishing Your Form
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Form ko live karna, unique public share link generate karna aur unpublish karna.
                </p>
              </div>

              {/* Real Screenshot */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <Image
                    src="/guide/07-settings-publish.png"
                    alt="Form Settings and Publish Flow"
                    width={1280}
                    height={850}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Settings &amp; Public Link Manager
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center">
                  Screenshot: Settings page with public link copying, theme colors and publish toggle.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-slate-900 text-sm block">
                    🚀 Form Publish Kaise Karein?
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 leading-relaxed">
                    <li>
                      Builder ke top right corner me <strong>&quot;Publish&quot;</strong> button par click karein.
                    </li>
                    <li>
                      Button green <strong>&quot;Published&quot;</strong> badge me change ho jayega aur success toast aayega.
                    </li>
                    <li>
                      Form ka ek unique <strong>Share ID</strong> create hota hai (Jaise: <em>/form/job-application-2026</em>).
                    </li>
                    <li>
                      Top bar me <strong>Share Icon</strong> dabayein — link aapke clipboard me copy ho jayega!
                    </li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-slate-900">🔒 Form Unpublish Kaise Karein?</p>
                  <p>
                    Agar aap temporary submissions rokna chahte hain, toh bas top bar me wahi button (ab &quot;Unpublish&quot;) dabayein.
                    Form wapas <strong>Draft</strong> ban jayega aur koi bhi public user submissions nahi kar payega.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 8: FILLING OUT A FORM */}
          {/* ========================================================= */}
          {activeLesson === 8 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 8 • Respondent Experience
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 8: Filling Out a Form (Conversational Flow)
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Typeform-inspired full-screen one-question-at-a-time experience.
                </p>
              </div>

              {/* Real Screenshot */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <Image
                    src="/guide/08-respondent-welcome.png"
                    alt="Public Respondent Experience"
                    width={1280}
                    height={800}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Respondent Welcome Screen
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center">
                  Screenshot: Clean distraction-free welcome screen with estimated duration and Start button.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="font-bold text-slate-900 text-sm block">
                    ⌨️ Respondent Keyboard Magic:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <strong>Enter ↵:</strong> Agle question par jaane ya submit karne ke liye.
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <strong>A, B, C, D:</strong> Multiple choice me option chunne ke liye.
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <strong>Y / N:</strong> Yes/No questions me instant answer karne ke liye.
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <strong>1, 2, 3, 4, 5:</strong> Rating scale buttons select karne ke liye.
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50/60 border border-violet-100 text-violet-950 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-violet-900">🎉 Thank You Screen &amp; Confetti:</p>
                  <p>
                    Jaise hi aakhri question submit hota hai, screen par celebration confetti burst hoti hai,
                    response database me store hota hai, aur user ko confirmation message dikhta hai!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 9: VIEWING RESPONSES */}
          {/* ========================================================= */}
          {activeLesson === 9 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Chapter 9 • Data &amp; Analytics
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 9: Viewing Responses &amp; Analytics
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Responses ka detailed breakdown, statistical charts, aur CSV spreadsheet export.
                </p>
              </div>

              {/* Real Screenshot */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                  <Image
                    src="/guide/09-results-analytics.png"
                    alt="Results and Analytics Dashboard"
                    width={1280}
                    height={850}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                    Live Analytics &amp; Visual Progress Breakdown
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic text-center">
                  Screenshot: Results dashboard with metric cards, completion rate and question-wise distribution.
                </p>
              </div>

              <div className="space-y-4 pt-2 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="font-bold text-indigo-600 text-sm block">
                      📊 1. Summary Tab:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Yahan har question ke answers ka auto-breakdown dikhta hai. Multiple choice me percentage bar chart,
                      Rating me average/min/max calculation, aur Text me collected answers ki list milti hai.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="font-bold text-indigo-600 text-sm block">
                      📋 2. Responses Tab:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      Table format me saare responses list hote hain. Kisi bhi row par click karke aap single response ka full detail modal dekh sakte hain.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-emerald-900">📥 1-Click CSV Export:</p>
                  <p>
                    Responses tab me <strong>&quot;Export to CSV&quot;</strong> button hai. Click karte hi ek Excel/Google Sheets compatible .csv file download ho jati hai jisme questions columns me aur har respondent ke answers rows me perfectly formatted hote hain!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON 10: COMPLETE END-TO-END PRACTICE */}
          {/* ========================================================= */}
          {activeLesson === 10 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Chapter 10 • Practical Hands-On Exercise
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  LESSON 10: Complete End-to-End Practice
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Ab baari hai aapke hands-on practice ki! Neeche diye gaye 10 steps ko follow karein aur check karte jayein.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1 text-xs">
                <p className="font-bold text-sm text-emerald-400">🎯 Aapka Mission:</p>
                <p className="text-slate-300">
                  Ek naya <strong>&quot;Customer Satisfaction Survey&quot;</strong> form banayein, usme 5 alag question types dalein,
                  publish karein, khud respond karein, aur results me apna response dekhein!
                </p>
              </div>

              {/* Interactive Checklist */}
              <div className="space-y-2 text-xs">
                {[
                  {
                    step: 1,
                    title: 'Dashboard me "Create Form" button par click karein',
                    desc: 'Dashboard kholiye aur "Create Form" button dabayein.',
                  },
                  {
                    step: 2,
                    title: 'Title likhein: "Customer Satisfaction Survey"',
                    desc: 'Blank canvas template choose karke continue karein.',
                  },
                  {
                    step: 3,
                    title: '5 Alag Question Types Add Karein',
                    desc: 'Short Text, Multiple Choice, Rating, Yes/No, aur Long Text add karein.',
                  },
                  {
                    step: 4,
                    title: 'Questions ko Drag and Drop karke reorder karein',
                    desc: 'Rating question ko upar drag karke dekhein.',
                  },
                  {
                    step: 5,
                    title: 'Kam se kam 2 questions ko "Required" toggle on karein',
                    desc: 'Required checkbox check karein taaki mandatory ban jaye.',
                  },
                  {
                    step: 6,
                    title: 'Live Preview me Desktop aur Mobile switch karke check karein',
                    desc: 'Right panel me phone frame icon dabakar layout dekhein.',
                  },
                  {
                    step: 7,
                    title: 'Top right me "Publish" button dabayein',
                    desc: 'Form ko live karein aur public share link generate hone dein.',
                  },
                  {
                    step: 8,
                    title: 'Public link ko new tab me open karein',
                    desc: '"Open Live" par click karke public respondent flow kholein.',
                  },
                  {
                    step: 9,
                    title: 'Saare questions fill karke submit karein',
                    desc: 'Enter aur keyboard shortcuts use karke submission complete karein.',
                  },
                  {
                    step: 10,
                    title: 'Results tab me aakar apna response verify karein',
                    desc: 'Summary aur Responses table me dekhein ki aapka answer add ho gaya!',
                  },
                ].map((item) => {
                  const isChecked = checklist[item.step];
                  return (
                    <div
                      key={item.step}
                      onClick={() => toggleChecklistItem(item.step)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition select-none ${
                        isChecked
                          ? 'border-emerald-300 bg-emerald-50/60 text-emerald-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border transition ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-bold ${
                            isChecked ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          Step {item.step}: {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Banner if all 10 checked */}
              {Object.values(checklist).every(Boolean) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center space-y-1 shadow-md">
                  <p className="font-bold text-base">🎉 Badhaai Ho! Aapne Exercise Complete Kar Li!</p>
                  <p className="text-xs text-emerald-100">
                    Aap FormFlow ke sabhi essential concepts aur workflows me completely certified hain.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* LESSON NAVIGATION FOOTER */}
          {/* ========================================================= */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveLesson((prev) => Math.max(1, prev - 1))}
              disabled={activeLesson === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Pichla Lesson</span>
            </button>

            <button
              onClick={() => toggleLessonComplete(activeLesson)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                completedLessons.includes(activeLesson)
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {completedLessons.includes(activeLesson) ? 'Completed ✓' : 'Mark as Done'}
              </span>
            </button>

            <button
              onClick={() => setActiveLesson((prev) => Math.min(10, prev + 1))}
              disabled={activeLesson === 10}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <span>Agla Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
