import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QuestionType } from '@/types/form';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export const QUESTION_TYPE_CONFIG: Record<
  QuestionType,
  { label: string; icon: string; description: string }
> = {
  short_text: {
    label: 'Short Text',
    icon: 'AlignLeft',
    description: 'A single-line answer for concise input',
  },
  long_text: {
    label: 'Long Text',
    icon: 'FileText',
    description: 'Multi-line answer for detailed comments',
  },
  multiple_choice: {
    label: 'Multiple Choice',
    icon: 'CheckSquare',
    description: 'Select one option from a list',
  },
  dropdown: {
    label: 'Dropdown',
    icon: 'ChevronDownCircle',
    description: 'Select an option from a compact menu',
  },
  email: {
    label: 'Email',
    icon: 'Mail',
    description: 'Validated email address input',
  },
  number: {
    label: 'Number',
    icon: 'Hash',
    description: 'Numeric value input with validation',
  },
  yes_no: {
    label: 'Yes / No',
    icon: 'ToggleLeft',
    description: 'Simple binary choice',
  },
  rating: {
    label: 'Rating',
    icon: 'Star',
    description: 'Configurable scale (1 to 5 or 10)',
  },
  file_upload: {
    label: 'File / PDF Resume',
    icon: 'FileUp',
    description: 'Upload PDF resumes, CVs, or documents',
  },
};
