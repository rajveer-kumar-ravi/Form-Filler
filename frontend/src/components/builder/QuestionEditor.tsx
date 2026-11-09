'use client';

import React from 'react';
import {
  Question,
  QuestionType,
  ScreenConfig,
} from '@/types/form';
import {
  AlignLeft,
  FileText,
  CheckSquare,
  ChevronDownCircle,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface QuestionEditorProps {
  question: Question | null;
  welcomeScreen: ScreenConfig;
  thankYouScreen: ScreenConfig;
  selectedId: number | 'welcome' | 'thank_you' | null;
  onUpdateQuestion: (data: Partial<Question>) => void;
  onUpdateWelcome: (data: Partial<ScreenConfig>) => void;
  onUpdateThankYou: (data: Partial<ScreenConfig>) => void;
}

export function QuestionEditor({
  question,
  welcomeScreen,
  thankYouScreen,
  selectedId,
  onUpdateQuestion,
  onUpdateWelcome,
  onUpdateThankYou,
}: QuestionEditorProps) {
  // If Welcome Screen is selected
  if (selectedId === 'welcome') {
    return (
      <div className="flex-1 bg-white p-8 overflow-y-auto max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            W
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Welcome Screen</h2>
            <p className="text-xs text-slate-500">First screen respondents see before starting</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={welcomeScreen.title}
              onChange={(e) => onUpdateWelcome({ title: e.target.value })}
              className="w-full text-xl font-bold text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-1.5 transition"
              placeholder="e.g. Welcome to our survey"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Description / Subtitle
            </label>
            <textarea
              rows={3}
              value={welcomeScreen.description}
              onChange={(e) => onUpdateWelcome({ description: e.target.value })}
              className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Please take 2 minutes to complete this form"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Start Button Label
            </label>
            <input
              type="text"
              value={welcomeScreen.buttonText}
              onChange={(e) => onUpdateWelcome({ buttonText: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Start"
            />
          </div>
        </div>
      </div>
    );
  }

  // If Thank You Screen is selected
  if (selectedId === 'thank_you') {
    return (
      <div className="flex-1 bg-white p-8 overflow-y-auto max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            T
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Thank You Screen</h2>
            <p className="text-xs text-slate-500">Screen shown after successful response submission</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={thankYouScreen.title}
              onChange={(e) => onUpdateThankYou({ title: e.target.value })}
              className="w-full text-xl font-bold text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-1.5 transition"
              placeholder="e.g. Thank you!"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Description / Confirmation Message
            </label>
            <textarea
              rows={3}
              value={thankYouScreen.description}
              onChange={(e) => onUpdateThankYou({ description: e.target.value })}
              className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Your response has been recorded."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Button Label (Optional)
            </label>
            <input
              type="text"
              value={thankYouScreen.buttonText}
              onChange={(e) => onUpdateThankYou({ buttonText: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Submit another response"
            />
          </div>
        </div>
      </div>
    );
  }

  // If No question is selected
  if (!question) {
    return (
      <div className="flex-1 bg-white p-8 flex items-center justify-center text-center">
        <div className="max-w-sm">
          <Sliders className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No question selected</h3>
          <p className="text-xs text-slate-400 mt-1">
            Select a question from the left sidebar or add a new one to begin editing.
          </p>
        </div>
      </div>
    );
  }

  // Render Question Editor
  const settings = question.settings || {};

  const handleSettingsChange = (key: string, value: any) => {
    onUpdateQuestion({
      settings: {
        ...settings,
        [key]: value,
      },
    });
  };

  const handleAddOption = () => {
    const currentOptions = settings.options || ['Option 1', 'Option 2'];
    const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
    handleSettingsChange('options', newOptions);
  };

  const handleOptionChange = (index: number, val: string) => {
    const currentOptions = [...(settings.options || [])];
    currentOptions[index] = val;
    handleSettingsChange('options', currentOptions);
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = [...(settings.options || [])];
    currentOptions.splice(index, 1);
    handleSettingsChange('options', currentOptions);
  };

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto max-w-2xl mx-auto w-full">
      {/* Question Type & Required Row */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Type:
          </span>
          <select
            value={question.type}
            onChange={(e) => onUpdateQuestion({ type: e.target.value as QuestionType })}
            className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="short_text">Short Text</option>
            <option value="long_text">Long Text</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="dropdown">Dropdown</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="yes_no">Yes / No</option>
            <option value="rating">Rating</option>
            <option value="file_upload">File / PDF Resume</option>
          </select>
        </div>

        {/* Required Switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-medium text-slate-600">Required</span>
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdateQuestion({ required: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
        </label>
      </div>

      {/* Main Question Title Input */}
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Question Title
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdateQuestion({ title: e.target.value })}
            placeholder="Type your question here..."
            className="w-full text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-1.5 transition placeholder:text-slate-300"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Help Text / Description (Optional)
          </label>
          <input
            type="text"
            value={question.description || ''}
            onChange={(e) => onUpdateQuestion({ description: e.target.value })}
            placeholder="Add a helpful description or instructions..."
            className="w-full text-sm text-slate-600 border-b border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:outline-none py-1 transition placeholder:text-slate-300"
          />
        </div>

        {/* Question Type Specific Settings */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Field Configuration
          </h4>

          {/* Multiple Choice & Dropdown Options */}
          {(question.type === 'multiple_choice' || question.type === 'dropdown') && (
            <div className="space-y-2.5">
              <label className="block text-xs font-medium text-slate-600">Choices</label>
              {(settings.options || ['Option 1', 'Option 2', 'Option 3']).map(
                (opt: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 w-5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleDeleteOption(idx)}
                      disabled={(settings.options || []).length <= 2}
                      className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add another option
              </button>
            </div>
          )}

          {/* Rating Scale Settings */}
          {question.type === 'rating' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Scale Steps (1 to N)
                </label>
                <div className="flex gap-2">
                  {[5, 7, 10].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => handleSettingsChange('scale', scale)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        (settings.scale || 5) === scale
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      1 to {scale}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Left Label (Min)
                  </label>
                  <input
                    type="text"
                    value={settings.minLabel || ''}
                    onChange={(e) => handleSettingsChange('minLabel', e.target.value)}
                    placeholder="e.g. Poor or Not likely"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Right Label (Max)
                  </label>
                  <input
                    type="text"
                    value={settings.maxLabel || ''}
                    onChange={(e) => handleSettingsChange('maxLabel', e.target.value)}
                    placeholder="e.g. Excellent or Highly likely"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Number Settings */}
          {question.type === 'number' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Minimum Value (Optional)
                </label>
                <input
                  type="number"
                  value={settings.min ?? ''}
                  onChange={(e) =>
                    handleSettingsChange('min', e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="e.g. 0"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Maximum Value (Optional)
                </label>
                <input
                  type="number"
                  value={settings.max ?? ''}
                  onChange={(e) =>
                    handleSettingsChange('max', e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="e.g. 100"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Text & Email Placeholder */}
          {(question.type === 'short_text' ||
            question.type === 'long_text' ||
            question.type === 'email' ||
            question.type === 'number') && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Input Placeholder Text
              </label>
              <input
                type="text"
                value={settings.placeholder || ''}
                onChange={(e) => handleSettingsChange('placeholder', e.target.value)}
                placeholder="e.g. Type your answer here..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Yes / No Note */}
          {question.type === 'yes_no' && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
              Renders two large interactive cards for &quot;Yes&quot; and &quot;No&quot; with keyboard shortcuts (Y and N).
            </div>
          )}

          {/* File / PDF Resume Upload Settings */}
          {question.type === 'file_upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Accepted File Formats
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'PDF Only (.pdf)', val: '.pdf' },
                    { label: 'PDF & Word (.pdf, .doc, .docx)', val: '.pdf,.doc,.docx' },
                    { label: 'All Documents & Images', val: '.pdf,.doc,.docx,.png,.jpg' },
                  ].map((fmt) => (
                    <button
                      key={fmt.val}
                      type="button"
                      onClick={() => handleSettingsChange('accept', fmt.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        (settings.accept || '.pdf') === fmt.val
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxSizeMB || 10}
                    onChange={(e) =>
                      handleSettingsChange('maxSizeMB', Number(e.target.value) || 10)
                    }
                    placeholder="10"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Upload Prompt Text
                  </label>
                  <input
                    type="text"
                    value={settings.placeholder || ''}
                    onChange={(e) => handleSettingsChange('placeholder', e.target.value)}
                    placeholder="e.g. Upload your Resume / CV in PDF format"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-rose-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  📄 PDF Resume Upload Active
                </span>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Respondents will be given a drag-and-drop file upload zone. Once uploaded, their PDF resume is safely stored on the server and clickable in your Results dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
