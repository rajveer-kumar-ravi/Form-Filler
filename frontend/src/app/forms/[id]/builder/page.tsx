'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Form, Question, QuestionType, ScreenConfig } from '@/types/form';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import { QuestionSidebar } from '@/components/builder/QuestionSidebar';
import { QuestionEditor } from '@/components/builder/QuestionEditor';
import { LivePreview } from '@/components/builder/LivePreview';
import { AddQuestionModal } from '@/components/builder/AddQuestionModal';
import { useToast } from '@/components/common/Toast';
import { Loader2 } from 'lucide-react';

export default function FormBuilderPage() {
  const params = useParams();
  const formId = Number(params.id);
  const router = useRouter();
  const { success, error } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | 'welcome' | 'thank_you' | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch form data
  const fetchForm = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getForm(formId);
      setForm(data);
      if (data.questions && data.questions.length > 0 && selectedId === null) {
        setSelectedId(data.questions[0].id);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load form details.');
    } finally {
      setLoading(false);
    }
  }, [formId, error]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  // Rename Form Title
  const handleTitleChange = async (newTitle: string) => {
    if (!form) return;
    try {
      const updated = await api.updateForm(form.id, { title: newTitle });
      setForm((prev) => (prev ? { ...prev, title: updated.title } : null));
      success('Form title updated.');
    } catch {
      error('Failed to update form title.');
    }
  };

  // Publish / Unpublish
  const handlePublishToggle = async () => {
    if (!form) return;
    setPublishing(true);
    try {
      if (form.status === 'published') {
        const res = await api.unpublishForm(form.id);
        setForm((prev) => (prev ? { ...prev, status: 'draft' } : null));
        success('Form unpublished. Responses are now paused.');
      } else {
        const res = await api.publishForm(form.id);
        setForm((prev) => (prev ? { ...prev, status: 'published' } : null));
        success('Form published! Live URL is ready to share.');
      }
    } catch {
      error('Failed to change publish status.');
    } finally {
      setPublishing(false);
    }
  };

  // Add Question
  const handleAddQuestion = async (type: QuestionType) => {
    if (!form) return;
    try {
      const defaultSettings: any = {};
      if (type === 'multiple_choice' || type === 'dropdown') {
        defaultSettings.options = ['Option 1', 'Option 2', 'Option 3'];
      } else if (type === 'rating') {
        defaultSettings.scale = 5;
        defaultSettings.minLabel = 'Poor';
        defaultSettings.maxLabel = 'Excellent';
      }

      const newQ = await api.createQuestion(form.id, {
        title: `Untitled ${type.replace('_', ' ')} question`,
        type,
        required: false,
        settings: defaultSettings,
      });

      setForm((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questions: [...prev.questions, newQ],
        };
      });

      setSelectedId(newQ.id);
      success('Question added!');
    } catch {
      error('Failed to add question.');
    }
  };

  // Update Active Question
  const handleUpdateQuestion = async (updates: Partial<Question>) => {
    if (!form || typeof selectedId !== 'number') return;

    // Optimistic UI update
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        questions: prev.questions.map((q) => (q.id === selectedId ? { ...q, ...updates } : q)),
      };
    });

    try {
      await api.updateQuestion(selectedId, updates);
    } catch {
      error('Failed to save question changes.');
    }
  };

  // Duplicate Question
  const handleDuplicateQuestion = async (q: Question) => {
    if (!form) return;
    try {
      const duplicated = await api.createQuestion(form.id, {
        title: `${q.title} (Copy)`,
        description: q.description,
        type: q.type,
        required: q.required,
        settings: q.settings,
      });

      setForm((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questions: [...prev.questions, duplicated],
        };
      });

      setSelectedId(duplicated.id);
      success('Question duplicated.');
    } catch {
      error('Failed to duplicate question.');
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (q: Question) => {
    if (!form) return;
    try {
      await api.deleteQuestion(q.id);
      const remaining = form.questions.filter((item) => item.id !== q.id);
      setForm((prev) => (prev ? { ...prev, questions: remaining } : null));

      if (selectedId === q.id) {
        setSelectedId(remaining.length > 0 ? remaining[0].id : 'welcome');
      }
      success('Question deleted.');
    } catch {
      error('Failed to delete question.');
    }
  };

  // Reorder Questions
  const handleReorder = async (newQuestions: Question[]) => {
    if (!form) return;
    setForm((prev) => (prev ? { ...prev, questions: newQuestions } : null));

    try {
      const payload = newQuestions.map((q, idx) => ({ id: q.id, position: idx }));
      await api.reorderQuestions(form.id, payload);
    } catch {
      error('Failed to persist question reorder.');
    }
  };

  // Update Welcome Screen
  const handleUpdateWelcome = async (updates: Partial<ScreenConfig>) => {
    if (!form) return;
    const newConfig = { ...form.welcome_screen, ...updates };
    setForm((prev) => (prev ? { ...prev, welcome_screen: newConfig } : null));
    try {
      await api.updateForm(form.id, { welcome_screen: newConfig });
    } catch {
      error('Failed to save welcome screen.');
    }
  };

  // Update Thank You Screen
  const handleUpdateThankYou = async (updates: Partial<ScreenConfig>) => {
    if (!form) return;
    const newConfig = { ...form.thank_you_screen, ...updates };
    setForm((prev) => (prev ? { ...prev, thank_you_screen: newConfig } : null));
    try {
      await api.updateForm(form.id, { thank_you_screen: newConfig });
    } catch {
      error('Failed to save thank you screen.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading FormFlow Builder...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Form not found.</p>
      </div>
    );
  }

  const currentQuestion =
    typeof selectedId === 'number'
      ? form.questions.find((q) => q.id === selectedId) || null
      : null;

  const currentIndex =
    typeof selectedId === 'number'
      ? form.questions.findIndex((q) => q.id === selectedId)
      : 0;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Builder Top Bar */}
      <BuilderHeader
        form={form}
        onTitleChange={handleTitleChange}
        onPublishToggle={handlePublishToggle}
        publishing={publishing}
        activeTab="builder"
      />

      {/* Main 3-Panel Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Questions List & Reordering */}
        <QuestionSidebar
          questions={form.questions}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onReorder={handleReorder}
          onAddClick={() => setIsAddModalOpen(true)}
          onDuplicateQuestion={handleDuplicateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />

        {/* CENTER PANEL: Main Question & Screen Editor */}
        <QuestionEditor
          question={currentQuestion}
          welcomeScreen={form.welcome_screen}
          thankYouScreen={form.thank_you_screen}
          selectedId={selectedId}
          onUpdateQuestion={handleUpdateQuestion}
          onUpdateWelcome={handleUpdateWelcome}
          onUpdateThankYou={handleUpdateThankYou}
        />

        {/* RIGHT PANEL: Live Interactive Preview */}
        <LivePreview
          question={currentQuestion}
          welcomeScreen={form.welcome_screen}
          thankYouScreen={form.thank_you_screen}
          selectedId={selectedId}
          currentIndex={currentIndex}
          totalQuestions={form.questions.length}
          theme={form.theme_config}
        />
      </div>

      {/* Add Question Modal */}
      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectType={handleAddQuestion}
      />
    </div>
  );
}
