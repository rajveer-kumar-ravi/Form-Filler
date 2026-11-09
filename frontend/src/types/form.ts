export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating'
  | 'file_upload';

export interface QuestionSettings {
  options?: string[];
  placeholder?: string;
  scale?: number;
  minLabel?: string;
  maxLabel?: string;
  min?: number;
  max?: number;
  [key: string]: any;
}

export interface LogicRule {
  id?: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
  target_question_id: number | 'thank_you' | 'submit';
}

export interface Question {
  id: number;
  form_id: number;
  title: string;
  description: string;
  type: QuestionType;
  position: number;
  required: boolean;
  settings: QuestionSettings;
  logic_rules?: LogicRule[];
  created_at: string;
  updated_at: string;
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface ScreenConfig {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
}

export interface Form {
  id: number;
  user_id: number;
  title: string;
  description: string;
  share_id: string;
  status: 'draft' | 'published' | 'archived';
  theme_config: ThemeConfig;
  welcome_screen: ScreenConfig;
  thank_you_screen: ScreenConfig;
  settings?: Record<string, any>;
  logic_rules?: LogicRule[];
  created_at: string;
  updated_at: string;
  questions: Question[];
  response_count?: number;
}

export interface FormListItem {
  id: number;
  title: string;
  description: string;
  share_id: string;
  status: 'draft' | 'published' | 'archived';
  response_count: number;
  question_count: number;
  updated_at: string;
  created_at: string;
}

export interface PublicQuestion {
  id: number;
  title: string;
  description: string;
  type: QuestionType;
  position: number;
  required: boolean;
  settings: QuestionSettings;
  logic_rules?: LogicRule[];
}

export interface PublicForm {
  title: string;
  description: string;
  share_id: string;
  theme_config: ThemeConfig;
  welcome_screen: ScreenConfig;
  thank_you_screen: ScreenConfig;
  settings?: Record<string, any>;
  logic_rules?: LogicRule[];
  questions: PublicQuestion[];
}

export interface AnswerDetail {
  id: number;
  question_id: number;
  question_title?: string;
  question_type?: QuestionType;
  answer_value: any;
  created_at: string;
}

export interface ResponseDetail {
  id: number;
  form_id: number;
  respondent_id: string | null;
  submitted_at: string;
  completion_status: string;
  answers: AnswerDetail[];
}

export interface OptionStat {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  question_id: number;
  title: string;
  type: QuestionType;
  total_answers: number;
  breakdown?: OptionStat[];
  average?: number;
  min?: number;
  max?: number;
  recent_answers?: string[];
}

export interface FormAnalytics {
  form_id: number;
  form_title: string;
  total_responses: number;
  completed_responses?: number;
  partial_responses?: number;
  completion_rate: number;
  abandonment_rate?: number;
  average_completion_time_seconds?: number;
  response_trends?: { date: string; count: number }[];
  first_response_at?: string;
  last_response_at?: string;
  questions: QuestionAnalytics[];
}
