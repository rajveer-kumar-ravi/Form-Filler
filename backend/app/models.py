import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    forms = relationship("Form", back_populates="user", cascade="all, delete-orphan")


class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Form")
    description = Column(Text, nullable=True, default="")
    share_id = Column(String(64), unique=True, index=True, nullable=False)
    status = Column(String(32), default="draft", index=True)  # "draft" | "published" | "archived"
    
    # Store theme settings like primaryColor, font, background
    theme_config = Column(JSON, default=dict)
    
    # Welcome & Thank You screen configurations
    welcome_screen = Column(JSON, default=dict)
    thank_you_screen = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="forms")
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.position")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False, default="Untitled Question")
    description = Column(Text, nullable=True, default="")
    type = Column(String(50), nullable=False)  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    position = Column(Integer, nullable=False, default=0, index=True)
    required = Column(Boolean, default=False)
    
    # settings stores question-specific options:
    # multiple_choice/dropdown: {"options": ["Option 1", "Option 2"]}
    # rating: {"scale": 5, "minLabel": "Worst", "maxLabel": "Best"}
    # number: {"min": 0, "max": 100}
    settings = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    form = relationship("Form", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    respondent_id = Column(String(128), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    completion_status = Column(String(32), default="completed")  # "completed" | "partial"

    # Relationships
    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_value = Column(JSON, nullable=True)  # Could be string, list of strings, number, bool
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
