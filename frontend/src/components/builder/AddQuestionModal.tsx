'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';
import { QuestionType } from '@/types/form';
import {
  AlignLeft,
  FileText,
  CheckSquare,
  ChevronDownCircle,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  FileUp,
} from 'lucide-react';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: QuestionType) => void;
}

export function AddQuestionModal({
  isOpen,
  onClose,
  onSelectType,
}: AddQuestionModalProps) {
  const questionTypes: {
    type: QuestionType;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      type: 'short_text',
      label: 'Short Text',
      description: 'Single-line text for names, titles, or brief input',
      icon: <AlignLeft className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-100',
    },
    {
      type: 'long_text',
      label: 'Long Text',
      description: 'Multi-line textarea for detailed feedback or descriptions',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-100',
    },
    {
      type: 'multiple_choice',
      label: 'Multiple Choice',
      description: 'Select one option from a list of predefined choices',
      icon: <CheckSquare className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-100',
    },
    {
      type: 'dropdown',
      label: 'Dropdown',
      description: 'Compact dropdown menu for selecting from many options',
      icon: <ChevronDownCircle className="w-5 h-5 text-cyan-600" />,
      color: 'bg-cyan-50 border-cyan-100',
    },
    {
      type: 'email',
      label: 'Email Address',
      description: 'Input validated specifically for email formats',
      icon: <Mail className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-100',
    },
    {
      type: 'number',
      label: 'Number',
      description: 'Numeric input with optional min/max boundary constraints',
      icon: <Hash className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-100',
    },
    {
      type: 'yes_no',
      label: 'Yes / No',
      description: 'Quick binary selection with one-click response',
      icon: <ToggleLeft className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-100',
    },
    {
      type: 'rating',
      label: 'Rating Scale',
      description: 'Interactive scale (1 to 5 or 10) with custom labels',
      icon: <Star className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50 border-amber-100',
    },
    {
      type: 'file_upload',
      label: 'File / PDF Resume',
      description: 'Upload PDF resumes, CVs, portfolios, or documents',
      icon: <FileUp className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-100',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add a Question"
      description="Choose the question type you want to append to your form."
      maxWidth="lg"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {questionTypes.map((item) => (
          <button
            key={item.type}
            onClick={() => {
              onSelectType(item.type);
              onClose();
            }}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-left transition group"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}
            >
              {item.icon}
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 transition">
                {item.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
