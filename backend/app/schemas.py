from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ---------------- USER SCHEMAS ---------------- #
class UserBase(BaseModel):
    name: str
    email: str


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- QUESTION SCHEMAS ---------------- #
class QuestionBase(BaseModel):
    title: str = "Untitled Question"
    description: Optional[str] = ""
    type: str  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    position: Optional[int] = 0
    required: Optional[bool] = False
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    position: Optional[int] = None
    required: Optional[bool] = None
    settings: Optional[Dict[str, Any]] = None


class QuestionResponse(QuestionBase):
    id: int
    form_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionReorderItem(BaseModel):
    id: int
    position: int


class QuestionReorderRequest(BaseModel):
    questions: List[QuestionReorderItem]


# ---------------- FORM SCHEMAS ---------------- #
class FormBase(BaseModel):
    title: str = "Untitled Form"
    description: Optional[str] = ""
    theme_config: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "primaryColor": "#6366F1",  # Indigo/Purple Typeform style
            "backgroundColor": "#FFFFFF",
            "textColor": "#111827",
            "fontFamily": "Inter",
            "borderRadius": "rounded-xl",
        }
    )
    welcome_screen: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "enabled": True,
            "title": "Welcome to our form",
            "description": "Please take a moment to answer these questions.",
            "buttonText": "Start",
        }
    )
    thank_you_screen: Optional[Dict[str, Any]] = Field(
        default_factory=lambda: {
            "enabled": True,
            "title": "Thank you!",
            "description": "Your response has been successfully submitted.",
            "buttonText": "Submit another response",
        }
    )


class FormCreate(FormBase):
    pass


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    theme_config: Optional[Dict[str, Any]] = None
    welcome_screen: Optional[Dict[str, Any]] = None
    thank_you_screen: Optional[Dict[str, Any]] = None
    status: Optional[str] = None


class FormListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    share_id: str
    status: str
    response_count: int = 0
    question_count: int = 0
    updated_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FormDetailResponse(FormBase):
    id: int
    user_id: int
    share_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []
    response_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# ---------------- PUBLIC FORM SCHEMAS ---------------- #
class PublicQuestionResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    type: str
    position: int
    required: bool
    settings: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)


class PublicFormResponse(BaseModel):
    title: str
    description: Optional[str] = ""
    share_id: str
    theme_config: Dict[str, Any] = {}
    welcome_screen: Dict[str, Any] = {}
    thank_you_screen: Dict[str, Any] = {}
    questions: List[PublicQuestionResponse] = []


# ---------------- RESPONSE & ANSWER SCHEMAS ---------------- #
class AnswerSubmission(BaseModel):
    question_id: int
    answer_value: Any


class ResponseSubmissionRequest(BaseModel):
    respondent_id: Optional[str] = None
    answers: List[AnswerSubmission]
    completion_status: Optional[str] = "completed"


class AnswerDetail(BaseModel):
    id: int
    question_id: int
    question_title: Optional[str] = None
    question_type: Optional[str] = None
    answer_value: Any
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResponseDetail(BaseModel):
    id: int
    form_id: int
    respondent_id: Optional[str] = None
    submitted_at: datetime
    completion_status: str
    answers: List[AnswerDetail] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------- ANALYTICS SCHEMAS ---------------- #
class OptionStat(BaseModel):
    label: str
    count: int
    percentage: float


class QuestionAnalytics(BaseModel):
    question_id: int
    title: str
    type: str
    total_answers: int
    # For multiple choice & dropdown:
    breakdown: Optional[List[OptionStat]] = None
    # For rating & number:
    average: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    # For text & email:
    recent_answers: Optional[List[str]] = None


class FormAnalyticsResponse(BaseModel):
    form_id: int
    form_title: str
    total_responses: int
    completion_rate: float
    first_response_at: Optional[datetime] = None
    last_response_at: Optional[datetime] = None
    questions: List[QuestionAnalytics] = []
