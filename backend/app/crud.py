import uuid
import csv
import io
import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app import models, schemas


def generate_share_id() -> str:
    # 8-character unique alphanumeric string
    return uuid.uuid4().hex[:8]


# --- USER HELPERS ---
def get_or_create_default_user(db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.email == "creator@formflow.io").first()
    if not user:
        user = models.User(name="FormFlow Creator", email="creator@formflow.io")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# --- FORM CRUD ---
def get_forms(db: Session, user_id: Optional[int] = None, search: Optional[str] = None, status: Optional[str] = None):
    query = db.query(models.Form)
    if user_id:
        query = query.filter(models.Form.user_id == user_id)
    if status and status != "all":
        query = query.filter(models.Form.status == status)
    if search:
        query = query.filter(models.Form.title.ilike(f"%{search}%"))

    forms = query.order_by(desc(models.Form.updated_at)).all()
    
    # Enrich with counts
    result = []
    for form in forms:
        resp_count = db.query(func.count(models.Response.id)).filter(models.Response.form_id == form.id).scalar() or 0
        q_count = db.query(func.count(models.Question.id)).filter(models.Question.form_id == form.id).scalar() or 0
        result.append({
            "id": form.id,
            "title": form.title,
            "description": form.description,
            "share_id": form.share_id,
            "status": form.status,
            "response_count": resp_count,
            "question_count": q_count,
            "updated_at": form.updated_at,
            "created_at": form.created_at,
        })
    return result


def get_form(db: Session, form_id: int) -> Optional[models.Form]:
    return db.query(models.Form).filter(models.Form.id == form_id).first()


def get_form_by_share_id(db: Session, share_id: str) -> Optional[models.Form]:
    return db.query(models.Form).filter(models.Form.share_id == share_id).first()


def create_form(db: Session, form_in: schemas.FormCreate, user_id: int) -> models.Form:
    share_id = generate_share_id()
    # Ensure share_id is unique
    while db.query(models.Form).filter(models.Form.share_id == share_id).first():
        share_id = generate_share_id()

    db_form = models.Form(
        user_id=user_id,
        title=form_in.title,
        description=form_in.description or "",
        share_id=share_id,
        status="draft",
        theme_config=form_in.theme_config or {
            "primaryColor": "#6366F1",
            "backgroundColor": "#FFFFFF",
            "textColor": "#111827",
            "fontFamily": "Inter",
            "borderRadius": "rounded-xl",
        },
        welcome_screen=form_in.welcome_screen or {
            "enabled": True,
            "title": "Welcome to our form",
            "description": "Please take a moment to answer these questions.",
            "buttonText": "Start",
        },
        thank_you_screen=form_in.thank_you_screen or {
            "enabled": True,
            "title": "Thank you!",
            "description": "Your response has been successfully recorded.",
            "buttonText": "Submit another response",
        },
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form


def update_form(db: Session, form_id: int, form_update: schemas.FormUpdate) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None

    update_data = form_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_form, field, value)

    db_form.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_form)
    return db_form


def delete_form(db: Session, form_id: int) -> bool:
    db_form = get_form(db, form_id)
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True


def duplicate_form(db: Session, form_id: int) -> Optional[models.Form]:
    orig_form = get_form(db, form_id)
    if not orig_form:
        return None

    new_share_id = generate_share_id()
    while db.query(models.Form).filter(models.Form.share_id == new_share_id).first():
        new_share_id = generate_share_id()

    new_form = models.Form(
        user_id=orig_form.user_id,
        title=f"{orig_form.title} (Copy)",
        description=orig_form.description,
        share_id=new_share_id,
        status="draft",
        theme_config=orig_form.theme_config,
        welcome_screen=orig_form.welcome_screen,
        thank_you_screen=orig_form.thank_you_screen,
    )
    db.add(new_form)
    db.flush()

    for q in orig_form.questions:
        new_q = models.Question(
            form_id=new_form.id,
            title=q.title,
            description=q.description,
            type=q.type,
            position=q.position,
            required=q.required,
            settings=q.settings,
        )
        db.add(new_q)

    db.commit()
    db.refresh(new_form)
    return new_form


def set_form_status(db: Session, form_id: int, status: str) -> Optional[models.Form]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None
    db_form.status = status
    db_form.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(db_form)
    return db_form


# --- QUESTION CRUD ---
def create_question(db: Session, form_id: int, q_in: schemas.QuestionCreate) -> Optional[models.Question]:
    db_form = get_form(db, form_id)
    if not db_form:
        return None

    # Calculate position
    max_pos = db.query(func.max(models.Question.position)).filter(models.Question.form_id == form_id).scalar()
    position = (max_pos + 1) if max_pos is not None else 0

    question = models.Question(
        form_id=form_id,
        title=q_in.title,
        description=q_in.description or "",
        type=q_in.type,
        position=position,
        required=q_in.required or False,
        settings=q_in.settings or {},
    )
    db.add(question)
    db_form.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(question)
    return question


def update_question(db: Session, question_id: int, q_update: schemas.QuestionUpdate) -> Optional[models.Question]:
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        return None

    update_data = q_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)

    question.updated_at = datetime.datetime.utcnow()
    if question.form:
        question.form.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(question)
    return question


def delete_question(db: Session, question_id: int) -> bool:
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        return False
    form_id = question.form_id
    db.delete(question)

    # Re-normalize positions of remaining questions
    remaining = db.query(models.Question).filter(models.Question.form_id == form_id).order_by(models.Question.position).all()
    for idx, q in enumerate(remaining):
        q.position = idx

    db_form = get_form(db, form_id)
    if db_form:
        db_form.updated_at = datetime.datetime.utcnow()

    db.commit()
    return True


def reorder_questions(db: Session, form_id: int, questions_order: List[schemas.QuestionReorderItem]) -> bool:
    for item in questions_order:
        q = db.query(models.Question).filter(
            models.Question.id == item.id,
            models.Question.form_id == form_id
        ).first()
        if q:
            q.position = item.position

    db_form = get_form(db, form_id)
    if db_form:
        db_form.updated_at = datetime.datetime.utcnow()

    db.commit()
    return True


# --- SUBMISSION CRUD ---
def submit_response(db: Session, share_id: str, submission: schemas.ResponseSubmissionRequest) -> Optional[models.Response]:
    form = get_form_by_share_id(db, share_id)
    if not form:
        return None
    if form.status != "published":
        raise ValueError("Cannot submit responses to an unpublished or draft form")

    # Validate required questions
    answers_map = {ans.question_id: ans.answer_value for ans in submission.answers}
    for q in form.questions:
        if q.required:
            val = answers_map.get(q.id)
            if (
                val is None
                or (isinstance(val, str) and not val.strip())
                or (isinstance(val, list) and len(val) == 0)
                or (isinstance(val, dict) and not val.get("url") and not val.get("filename"))
            ):
                raise ValueError(f"Question '{q.title}' is required.")

    # Create response record
    response = models.Response(
        form_id=form.id,
        respondent_id=submission.respondent_id or str(uuid.uuid4()),
        completion_status=submission.completion_status or "completed",
        submitted_at=datetime.datetime.utcnow(),
    )
    db.add(response)
    db.flush()

    # Create answer records
    for ans in submission.answers:
        # verify question belongs to this form
        q = db.query(models.Question).filter(
            models.Question.id == ans.question_id,
            models.Question.form_id == form.id
        ).first()
        if q:
            answer_record = models.Answer(
                response_id=response.id,
                question_id=ans.question_id,
                answer_value=ans.answer_value,
            )
            db.add(answer_record)

    db.commit()
    db.refresh(response)
    return response


def get_form_responses(db: Session, form_id: int) -> List[Dict[str, Any]]:
    responses = db.query(models.Response).filter(
        models.Response.form_id == form_id
    ).order_by(desc(models.Response.submitted_at)).all()

    result = []
    for resp in responses:
        answers_data = []
        for ans in resp.answers:
            answers_data.append({
                "id": ans.id,
                "question_id": ans.question_id,
                "question_title": ans.question.title if ans.question else "",
                "question_type": ans.question.type if ans.question else "",
                "answer_value": ans.answer_value,
                "created_at": ans.created_at,
            })
        result.append({
            "id": resp.id,
            "form_id": resp.form_id,
            "respondent_id": resp.respondent_id,
            "submitted_at": resp.submitted_at,
            "completion_status": resp.completion_status,
            "answers": answers_data,
        })
    return result


def get_response_detail(db: Session, response_id: int) -> Optional[Dict[str, Any]]:
    resp = db.query(models.Response).filter(models.Response.id == response_id).first()
    if not resp:
        return None

    answers_data = []
    for ans in resp.answers:
        answers_data.append({
            "id": ans.id,
            "question_id": ans.question_id,
            "question_title": ans.question.title if ans.question else "",
            "question_type": ans.question.type if ans.question else "",
            "answer_value": ans.answer_value,
            "created_at": ans.created_at,
        })

    return {
        "id": resp.id,
        "form_id": resp.form_id,
        "respondent_id": resp.respondent_id,
        "submitted_at": resp.submitted_at,
        "completion_status": resp.completion_status,
        "answers": answers_data,
    }


def get_form_analytics(db: Session, form_id: int) -> Optional[Dict[str, Any]]:
    form = get_form(db, form_id)
    if not form:
        return None

    responses = db.query(models.Response).filter(models.Response.form_id == form_id).all()
    total_responses = len(responses)
    completed_responses = sum(1 for r in responses if r.completion_status == "completed")
    completion_rate = (completed_responses / total_responses * 100.0) if total_responses > 0 else 0.0

    first_resp = db.query(func.min(models.Response.submitted_at)).filter(models.Response.form_id == form_id).scalar()
    last_resp = db.query(func.max(models.Response.submitted_at)).filter(models.Response.form_id == form_id).scalar()

    questions_analytics = []
    for q in form.questions:
        # Fetch all answers for this question
        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
        valid_answers = [a.answer_value for a in answers if a.answer_value is not None]

        q_stat = {
            "question_id": q.id,
            "title": q.title,
            "type": q.type,
            "total_answers": len(valid_answers),
            "breakdown": None,
            "average": None,
            "min": None,
            "max": None,
            "recent_answers": None,
        }

        if q.type in ["multiple_choice", "dropdown", "yes_no"]:
            # Count options
            counts: Dict[str, int] = {}
            # Initialize with configured options
            configured_options = []
            if q.type == "yes_no":
                configured_options = ["Yes", "No"]
            elif q.settings and "options" in q.settings:
                configured_options = [opt if isinstance(opt, str) else opt.get("label", str(opt)) for opt in q.settings.get("options", [])]

            for opt in configured_options:
                counts[opt] = 0

            for val in valid_answers:
                if isinstance(val, list):
                    for v in val:
                        counts[str(v)] = counts.get(str(v), 0) + 1
                else:
                    counts[str(val)] = counts.get(str(val), 0) + 1

            total_sel = sum(counts.values()) or 1
            breakdown = [
                {
                    "label": k,
                    "count": v,
                    "percentage": round((v / total_sel) * 100.0, 1),
                }
                for k, v in counts.items()
            ]
            q_stat["breakdown"] = breakdown

        elif q.type in ["rating", "number"]:
            numeric_vals = []
            for val in valid_answers:
                try:
                    num = float(val)
                    numeric_vals.append(num)
                except (ValueError, TypeError):
                    pass
            if numeric_vals:
                q_stat["average"] = round(sum(numeric_vals) / len(numeric_vals), 2)
                q_stat["min"] = min(numeric_vals)
                q_stat["max"] = max(numeric_vals)

        else:
            # text, email, long_text
            text_vals = [str(val) for val in valid_answers if str(val).strip()]
            q_stat["recent_answers"] = text_vals[-20:]  # most recent 20

        questions_analytics.append(q_stat)

    return {
        "form_id": form.id,
        "form_title": form.title,
        "total_responses": total_responses,
        "completion_rate": round(completion_rate, 1),
        "first_response_at": first_resp,
        "last_response_at": last_resp,
        "questions": questions_analytics,
    }


def export_responses_csv(db: Session, form_id: int) -> str:
    form = get_form(db, form_id)
    if not form:
        return ""

    responses = db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at).all()
    questions = form.questions

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    headers = ["Response ID", "Respondent ID", "Submitted At", "Completion Status"]
    for q in questions:
        headers.append(f"{q.title} ({q.type})")
    writer.writerow(headers)

    # Rows
    for resp in responses:
        answers_dict = {a.question_id: a.answer_value for a in resp.answers}
        row = [
            resp.id,
            resp.respondent_id or "Anonymous",
            resp.submitted_at.isoformat() if resp.submitted_at else "",
            resp.completion_status,
        ]
        for q in questions:
            val = answers_dict.get(q.id, "")
            if isinstance(val, dict):
                row.append(val.get("url") or val.get("filename") or str(val))
            elif isinstance(val, list):
                row.append(", ".join(str(item) for item in val))
            elif val is None:
                row.append("")
            else:
                row.append(str(val))
        writer.writerow(row)

    return output.getvalue()
