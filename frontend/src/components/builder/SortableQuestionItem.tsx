'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  AlignLeft,
  FileText,
  CheckSquare,
  ChevronDownCircle,
  Mail,
  Hash,
  ToggleLeft,
  Star,
  FileUp,
  Copy,
  Trash2,
} from 'lucide-react';
import { Question, QuestionType } from '@/types/form';

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function SortableQuestionItem({
  question,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const getIcon = (type: QuestionType) => {
    switch (type) {
      case 'short_text':
        return <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />;
      case 'long_text':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'multiple_choice':
        return <CheckSquare className="w-3.5 h-3.5 text-purple-500" />;
      case 'dropdown':
        return <ChevronDownCircle className="w-3.5 h-3.5 text-cyan-500" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-emerald-500" />;
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-amber-500" />;
      case 'yes_no':
        return <ToggleLeft className="w-3.5 h-3.5 text-teal-500" />;
      case 'rating':
        return <Star className="w-3.5 h-3.5 text-amber-500" />;
      case 'file_upload':
        return <FileUp className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <AlignLeft className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all duration-150 ${
        isSelected
          ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-300 hover:text-slate-600 transition"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Index and Type Icon */}
        <span className="text-[11px] font-semibold text-slate-400 w-4 text-center">
          {index + 1}
        </span>

        <div className="p-1 rounded-md bg-slate-100 flex-shrink-0">
          {getIcon(question.type)}
        </div>

        {/* Question Title */}
        <p className="text-xs font-medium text-slate-800 truncate flex-1">
          {question.title || 'Untitled question'}
        </p>

        {question.required && (
          <span className="text-rose-500 font-bold text-xs" title="Required">
            *
          </span>
        )}
      </div>

      {/* Hover action icons */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity pl-2">
        <button
          onClick={onDuplicate}
          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          title="Duplicate question"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition"
          title="Delete question"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
