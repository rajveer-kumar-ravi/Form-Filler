'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Question } from '@/types/form';
import { SortableQuestionItem } from './SortableQuestionItem';
import { Button } from '@/components/common/Button';

interface QuestionSidebarProps {
  questions: Question[];
  selectedId: number | 'welcome' | 'thank_you' | null;
  onSelect: (id: number | 'welcome' | 'thank_you') => void;
  onReorder: (newQuestions: Question[]) => void;
  onAddClick: () => void;
  onDuplicateQuestion: (q: Question) => void;
  onDeleteQuestion: (q: Question) => void;
}

export function QuestionSidebar({
  questions,
  selectedId,
  onSelect,
  onReorder,
  onAddClick,
  onDuplicateQuestion,
  onDeleteQuestion,
}: QuestionSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({
        ...q,
        position: idx,
      }));
      onReorder(reordered);
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Form Steps ({questions.length})
          </span>
        </div>
        <Button size="sm" variant="ghost" onClick={onAddClick} className="!p-1.5 h-7">
          <Plus className="w-4 h-4 text-indigo-600" />
        </Button>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Welcome Screen Card */}
        <div
          onClick={() => onSelect('welcome')}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition text-xs font-medium ${
            selectedId === 'welcome'
              ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-semibold shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-[10px]">
            W
          </div>
          <span className="truncate flex-1">Welcome Screen</span>
        </div>

        {/* Draggable Questions */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {questions.map((q, idx) => (
                <SortableQuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  isSelected={selectedId === q.id}
                  onSelect={() => onSelect(q.id)}
                  onDuplicate={(e) => {
                    e.stopPropagation();
                    onDuplicateQuestion(q);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDeleteQuestion(q);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Thank You Screen Card */}
        <div
          onClick={() => onSelect('thank_you')}
          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition text-xs font-medium ${
            selectedId === 'thank_you'
              ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-semibold shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
            T
          </div>
          <span className="truncate flex-1">Thank You Screen</span>
        </div>

        {/* Add Question Button */}
        <div className="pt-2">
          <button
            onClick={onAddClick}
            className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/30 flex items-center justify-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Question
          </button>
        </div>
      </div>
    </aside>
  );
}
