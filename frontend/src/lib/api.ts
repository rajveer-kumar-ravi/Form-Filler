import axios from 'axios';
import {
  Form,
  FormListItem,
  Question,
  PublicForm,
  ResponseDetail,
  FormAnalytics,
} from '@/types/form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getApiUrl = (path: string = '') => {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Forms
  getForms: async (search?: string, status?: string): Promise<FormListItem[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    const res = await apiClient.get<FormListItem[]>('/api/forms', { params });
    return res.data;
  },

  getForm: async (id: number | string): Promise<Form> => {
    const res = await apiClient.get<Form>(`/api/forms/${id}`);
    return res.data;
  },

  createForm: async (data: Partial<Form>): Promise<Form> => {
    const res = await apiClient.post<Form>('/api/forms', data);
    return res.data;
  },

  updateForm: async (id: number | string, data: Partial<Form>): Promise<Form> => {
    const res = await apiClient.put<Form>(`/api/forms/${id}`, data);
    return res.data;
  },

  deleteForm: async (id: number | string): Promise<{ message: string; id: number }> => {
    const res = await apiClient.delete<{ message: string; id: number }>(`/api/forms/${id}`);
    return res.data;
  },

  duplicateForm: async (id: number | string): Promise<Form> => {
    const res = await apiClient.post<Form>(`/api/forms/${id}/duplicate`);
    return res.data;
  },

  publishForm: async (id: number | string): Promise<Form> => {
    const res = await apiClient.post<Form>(`/api/forms/${id}/publish`);
    return res.data;
  },

  unpublishForm: async (id: number | string): Promise<Form> => {
    const res = await apiClient.post<Form>(`/api/forms/${id}/unpublish`);
    return res.data;
  },

  // Questions
  createQuestion: async (formId: number | string, data: Partial<Question>): Promise<Question> => {
    const res = await apiClient.post<Question>(`/api/forms/${formId}/questions`, data);
    return res.data;
  },

  updateQuestion: async (questionId: number | string, data: Partial<Question>): Promise<Question> => {
    const res = await apiClient.put<Question>(`/api/questions/${questionId}`, data);
    return res.data;
  },

  deleteQuestion: async (questionId: number | string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/api/questions/${questionId}`);
    return res.data;
  },

  reorderQuestions: async (
    formId: number | string,
    questions: { id: number; position: number }[]
  ): Promise<{ message: string }> => {
    const res = await apiClient.put<{ message: string }>(`/api/forms/${formId}/questions/reorder`, {
      questions,
    });
    return res.data;
  },

  // Public
  getPublicForm: async (shareId: string): Promise<PublicForm> => {
    const res = await apiClient.get<PublicForm>(`/api/public/forms/${shareId}`);
    return res.data;
  },

  submitPublicResponse: async (
    shareId: string,
    payload: {
      respondent_id?: string;
      answers: { question_id: number; answer_value: any }[];
      completion_status?: string;
    }
  ): Promise<{ success: boolean; response_id: number; message: string }> => {
    const res = await apiClient.post<{ success: boolean; response_id: number; message: string }>(
      `/api/public/forms/${shareId}/responses`,
      payload
    );
    return res.data;
  },

  // Results & Analytics
  getFormResponses: async (formId: number | string): Promise<ResponseDetail[]> => {
    const res = await apiClient.get<ResponseDetail[]>(`/api/forms/${formId}/responses`);
    return res.data;
  },

  getResponseDetail: async (
    formId: number | string,
    responseId: number | string
  ): Promise<ResponseDetail> => {
    const res = await apiClient.get<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`);
    return res.data;
  },

  getFormAnalytics: async (formId: number | string): Promise<FormAnalytics> => {
    const res = await apiClient.get<FormAnalytics>(`/api/forms/${formId}/analytics`);
    return res.data;
  },

  getExportUrl: (formId: number | string): string => {
    return `${API_BASE_URL}/api/forms/${formId}/export`;
  },

  // Upload
  uploadFile: async (
    file: File
  ): Promise<{ url: string; filename: string; size: number; size_formatted: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{
      url: string;
      filename: string;
      size: number;
      size_formatted: string;
    }>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
