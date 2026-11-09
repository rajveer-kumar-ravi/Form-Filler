'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Form, Question, LogicRule } from '@/types/form';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import { useToast } from '@/components/common/Toast';
import {
  GitBranch,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function FormLogicPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Local state for question rules: { [questionId: number]: LogicRule[] }
  const [rulesMap, setRulesMap] = useState<Record<number, LogicRule[]>>({});

  // Interactive Simulator state
  const [simStep, setSimStep] = useState<number>(0);
  const [simAnswers, setSimAnswers] = useState<Record<number, any>>({});
  const [simHistory, setSimHistory] = useState<number[]>([]);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await api.getForm(formId);
      setForm(data);

      const map: Record<number, LogicRule[]> = {};
      data.questions.forEach((q) => {
        map[q.id] = q.logic_rules ? [...q.logic_rules] : [];
      });
      setRulesMap(map);
    } catch (err: any) {
      toastError(err?.response?.data?.detail || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!form) return;
    try {
      setPublishing(true);
      if (form.status === 'published') {
        const updated = await api.unpublishForm(form.id);
        setForm(updated);
        success('Form unpublished');
      } else {
        const updated = await api.publishForm(form.id);
        setForm(updated);
        success('Form published successfully!');
      }
    } catch (err: any) {
      toastError(err?.response?.data?.detail || 'Failed to update publish status');
    } finally {
      setPublishing(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    if (!form) return;
    try {
      const updated = await api.updateForm(form.id, { title: newTitle });
      setForm(updated);
      success('Title updated');
    } catch {
      toastError('Failed to update title');
    }
  };

  const addRule = (questionId: number) => {
    if (!form) return;
    const currentQ = form.questions.find((q) => q.id === questionId);
    const defaultValue =
      currentQ?.settings?.options && currentQ.settings.options.length > 0
        ? currentQ.settings.options[0]
        : currentQ?.type === 'yes_no'
        ? 'Yes'
        : '';

    // Default target: next question or thank you
    const sorted = [...form.questions].sort((a, b) => a.position - b.position);
    const curIdx = sorted.findIndex((q) => q.id === questionId);
    const nextQ = sorted[curIdx + 1];
    const defaultTarget = nextQ ? nextQ.id : 'thank_you';

    const newRule: LogicRule = {
      id: Math.random().toString(36).substring(2, 9),
      condition: 'equals',
      value: defaultValue,
      target_question_id: defaultTarget,
    };

    setRulesMap((prev) => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), newRule],
    }));
  };

  const updateRule = (questionId: number, index: number, updates: Partial<LogicRule>) => {
    setRulesMap((prev) => {
      const list = [...(prev[questionId] || [])];
      list[index] = { ...list[index], ...updates };
      return { ...prev, [questionId]: list };
    });
  };

  const removeRule = (questionId: number, index: number) => {
    setRulesMap((prev) => {
      const list = [...(prev[questionId] || [])];
      list.splice(index, 1);
      return { ...prev, [questionId]: list };
    });
  };

  const saveAllLogic = async () => {
    if (!form) return;
    try {
      setSaving(true);
      for (const q of form.questions) {
        const rules = rulesMap[q.id] || [];
        await api.updateQuestion(q.id, { logic_rules: rules });
      }
      success('Conditional logic saved successfully!');
      loadForm();
    } catch (err: any) {
      toastError(err?.response?.data?.detail || 'Failed to save logic rules');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-14 bg-white border-b border-slate-200" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const sortedQuestions = [...form.questions].sort((a, b) => a.position - b.position);

  // Evaluate rule in simulator
  const simCurrentQ = !simCompleted && sortedQuestions[simStep] ? sortedQuestions[simStep] : null;

  const handleSimAnswer = (val: any) => {
    if (!simCurrentQ) return;
    const updatedAnswers = { ...simAnswers, [simCurrentQ.id]: val };
    setSimAnswers(updatedAnswers);

    // Check rules for current question
    const rules = rulesMap[simCurrentQ.id] || [];
    let targetIdx: number | null = null;
    let finish = false;

    for (const rule of rules) {
      const cond = rule.condition || 'equals';
      const ruleVal = rule.value;
      let matched = false;

      if (cond === 'equals') {
        matched = String(val).trim().toLowerCase() === String(ruleVal).trim().toLowerCase();
      } else if (cond === 'not_equals') {
        matched = String(val).trim().toLowerCase() !== String(ruleVal).trim().toLowerCase();
      } else if (cond === 'contains') {
        matched = String(val).toLowerCase().includes(String(ruleVal).toLowerCase());
      }

      if (matched) {
        if (rule.target_question_id === 'thank_you' || rule.target_question_id === 'submit') {
          finish = true;
          break;
        } else {
          const foundIdx = sortedQuestions.findIndex((q) => q.id === Number(rule.target_question_id));
          if (foundIdx !== -1 && foundIdx > simStep) {
            targetIdx = foundIdx;
            break;
          }
        }
      }
    }

    setSimHistory((prev) => [...prev, simStep]);

    if (finish) {
      setSimCompleted(true);
    } else if (targetIdx !== null) {
      setSimStep(targetIdx);
    } else {
      if (simStep + 1 < sortedQuestions.length) {
        setSimStep(simStep + 1);
      } else {
        setSimCompleted(true);
      }
    }
  };

  const resetSimulator = () => {
    setSimStep(0);
    setSimAnswers({});
    setSimHistory([]);
    setSimCompleted(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <BuilderHeader
        form={form}
        onTitleChange={handleTitleChange}
        onPublishToggle={handlePublishToggle}
        publishing={publishing}
        activeTab="logic"
      />

      {/* Main Logic Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <GitBranch className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">Conditional Logic & Branching</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Create smart branching paths based on how respondents answer. Forward respondents to specific questions or jump straight to the thank-you screen.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={saveAllLogic}
              loading={saving}
              variant="primary"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Logic Rules
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules Builder Canvas (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {sortedQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-sm text-slate-500">No questions found in this form yet.</p>
                <Button
                  onClick={() => router.push(`/forms/${form.id}/builder`)}
                  variant="outline"
                  className="mt-3"
                >
                  Go to Builder to add questions
                </Button>
              </div>
            ) : (
              sortedQuestions.map((q, idx) => {
                const rules = rulesMap[q.id] || [];
                const subsequentQuestions = sortedQuestions.filter((other) => other.position > q.position);

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition hover:border-slate-300"
                  >
                    {/* Question Header Card */}
                    <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{q.title}</h3>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {q.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => addRule(q.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Logic Jump</span>
                      </button>
                    </div>

                    {/* Rules List */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {rules.length === 0 ? (
                        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-150">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            Default Path:
                          </span>
                          <span className="font-semibold text-slate-700">
                            {idx + 1 < sortedQuestions.length
                              ? `Always proceeds to Question ${idx + 2}: "${sortedQuestions[idx + 1].title.slice(0, 28)}..."`
                              : 'Submits and proceeds to Thank You screen'}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {rules.map((rule, rIdx) => (
                            <div
                              key={rule.id || rIdx}
                              className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs"
                            >
                              {/* IF answer */}
                              <div className="flex items-center gap-1.5 font-bold text-indigo-600 shrink-0">
                                <span className="bg-indigo-100/70 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">IF</span>
                                <span>Answer</span>
                              </div>

                              {/* Condition Selector */}
                              <select
                                value={rule.condition}
                                onChange={(e) =>
                                  updateRule(q.id, rIdx, {
                                    condition: e.target.value as 'equals' | 'not_equals' | 'contains',
                                  })
                                }
                                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="equals">is equal to</option>
                                <option value="not_equals">is not equal to</option>
                                <option value="contains">contains text</option>
                              </select>

                              {/* Value Input / Dropdown */}
                              {q.settings?.options && q.settings.options.length > 0 ? (
                                <select
                                  value={rule.value}
                                  onChange={(e) => updateRule(q.id, rIdx, { value: e.target.value })}
                                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 flex-1 max-w-[160px]"
                                >
                                  {q.settings.options.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : q.type === 'yes_no' ? (
                                <select
                                  value={rule.value}
                                  onChange={(e) => updateRule(q.id, rIdx, { value: e.target.value })}
                                  className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 flex-1 max-w-[120px]"
                                >
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={rule.value}
                                  placeholder="Value..."
                                  onChange={(e) => updateRule(q.id, rIdx, { value: e.target.value })}
                                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 flex-1"
                                />
                              )}

                              {/* THEN jump to */}
                              <div className="flex items-center gap-1.5 font-bold text-indigo-600 shrink-0">
                                <ArrowRight className="w-3.5 h-3.5" />
                                <span className="bg-indigo-100/70 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">THEN</span>
                              </div>

                              {/* Target Question */}
                              <select
                                value={rule.target_question_id}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateRule(q.id, rIdx, {
                                    target_question_id: val === 'thank_you' ? 'thank_you' : Number(val),
                                  });
                                }}
                                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 flex-1"
                              >
                                {subsequentQuestions.map((subQ) => (
                                  <option key={subQ.id} value={subQ.id}>
                                    Jump to Q{sortedQuestions.findIndex((s) => s.id === subQ.id) + 1}: {subQ.title.slice(0, 24)}...
                                  </option>
                                ))}
                                <option value="thank_you">🏁 Jump to Thank You Screen (End)</option>
                              </select>

                              {/* Delete button */}
                              <button
                                onClick={() => removeRule(q.id, rIdx)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition shrink-0 ml-auto"
                                title="Remove condition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* Fallback note */}
                          <div className="text-[11px] text-slate-400 pl-2 italic">
                            Otherwise → proceeds to{' '}
                            {idx + 1 < sortedQuestions.length
                              ? `Question ${idx + 2}`
                              : 'Thank You screen'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Logic Simulator & Guide (Right Col) */}
          <div className="space-y-6">
            {/* Live Interactive Simulator */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Logic Flow Simulator</h3>
                </div>
                <button
                  onClick={resetSimulator}
                  className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 font-semibold"
                  title="Reset test simulator"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Test your branching jumps in real-time before publishing. See which questions appear based on responses.
              </p>

              {sortedQuestions.length === 0 ? (
                <p className="text-xs text-slate-400">Add questions to test simulation.</p>
              ) : simCompleted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <h4 className="text-xs font-bold text-emerald-800">Branching Flow Completed!</h4>
                  <p className="text-[11px] text-emerald-700">
                    Respondent reached the Thank You screen successfully through {simHistory.length + 1} steps.
                  </p>
                  <Button size="sm" variant="outline" onClick={resetSimulator} className="mt-2 text-xs">
                    Test Again
                  </Button>
                </div>
              ) : simCurrentQ ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-indigo-600">
                      Step {simStep + 1} of {sortedQuestions.length}
                    </span>
                    <span className="uppercase text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                      {simCurrentQ.type.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{simCurrentQ.title}</h4>

                  {/* Simulate Options */}
                  {simCurrentQ.settings?.options && simCurrentQ.settings.options.length > 0 ? (
                    <div className="space-y-1.5">
                      {simCurrentQ.settings.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSimAnswer(opt)}
                          className="w-full text-left px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40 transition"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : simCurrentQ.type === 'yes_no' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSimAnswer('Yes')}
                        className="py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40 transition text-center"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleSimAnswer('No')}
                        className="py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/40 transition text-center"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type answer & press enter..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSimAnswer((e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          handleSimAnswer(input.value || 'Test answer');
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Tips card */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pro Tip</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Conditional logic automatically marks bypassed questions as optional, ensuring respondents are never blocked by required fields they skipped.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
