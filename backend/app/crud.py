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


def check_form_availability(form: models.Form, db: Session) -> tuple[bool, str]:
    """Check if form is published and within response limit / closing date constraints."""
    if form.status != "published":
        return False, "This form is currently in draft or paused mode."
    
    settings = form.settings or {}
    
    # Check closing date
    closing_date_str = settings.get("closing_date")
    if closing_date_str:
        try:
            closing_dt = datetime.datetime.fromisoformat(closing_date_str.replace("Z", "+00:00"))
            if datetime.datetime.utcnow() > closing_dt.replace(tzinfo=None):
                msg = settings.get("closed_message") or "This form has closed and is no longer accepting responses."
                return False, msg
        except Exception:
            pass

    # Check response limit
    response_limit = settings.get("response_limit")
    if response_limit and int(response_limit) > 0:
        completed_count = db.query(models.Response).filter(
            models.Response.form_id == form.id,
            models.Response.completion_status == "completed"
        ).count()
        if completed_count >= int(response_limit):
            msg = settings.get("closed_message") or "This form has reached its maximum response limit."
            return False, msg

    return True, ""


def evaluate_condition(condition: str, rule_value: Any, user_answer: Any) -> bool:
    """Evaluate a single logic rule condition."""
    if condition == "equals":
        if isinstance(user_answer, list):
            return str(rule_value).strip().lower() in [str(x).strip().lower() for x in user_answer]
        return str(rule_value).strip().lower() == str(user_answer or "").strip().lower()
    elif condition == "not_equals":
        if isinstance(user_answer, list):
            return str(rule_value).strip().lower() not in [str(x).strip().lower() for x in user_answer]
        return str(rule_value).strip().lower() != str(user_answer or "").strip().lower()
    elif condition == "contains":
        return str(rule_value).strip().lower() in str(user_answer or "").strip().lower()
    return False


def get_active_question_ids(form: models.Form, answers_map: Dict[int, Any]) -> List[int]:
    """Calculate the ordered list of question IDs visited based on logic jump rules."""
    questions = sorted(form.questions, key=lambda q: q.position)
    if not questions:
        return []

    q_by_id = {q.id: q for q in questions}
    visited = []
    visited_set = set()
    current_idx = 0

    while current_idx < len(questions):
        current_q = questions[current_idx]
        if current_q.id in visited_set:
            break
        visited.append(current_q.id)
        visited_set.add(current_q.id)

        rules = current_q.logic_rules or []
        jumped = False
        user_val = answers_map.get(current_q.id)

        for rule in rules:
            cond = rule.get("condition", "equals")
            target_val = rule.get("value")
            target_id = rule.get("target_question_id")

            if evaluate_condition(cond, target_val, user_val):
                if target_id == "thank_you" or target_id == "submit":
                    return visited
                elif target_id in q_by_id:
                    target_idx = next((i for i, q in enumerate(questions) if q.id == target_id), None)
                    if target_idx is not None and target_idx > current_idx:
                        current_idx = target_idx
                        jumped = True
                        break
        if not jumped:
            current_idx += 1

    return visited


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
        settings=orig_form.settings or {},
        logic_rules=orig_form.logic_rules or [],
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
            logic_rules=q.logic_rules or [],
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
        logic_rules=q_in.logic_rules or [],
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


# --- SESSION & PARTIAL RESPONSE TRACKING ---
def init_or_resume_session(
    db: Session,
    share_id: str,
    session_id: Optional[str] = None,
    respondent_id: Optional[str] = None
) -> tuple[models.Response, bool]:
    form = get_form_by_share_id(db, share_id)
    if not form:
        raise ValueError("Form not found")

    is_open, msg = check_form_availability(form, db)
    if not is_open:
        raise ValueError(msg)

    # Check existing session
    if session_id:
        existing = db.query(models.Response).filter(
            models.Response.session_id == session_id,
            models.Response.form_id == form.id
        ).first()
        if existing:
            existing.last_activity_at = datetime.datetime.utcnow()
            db.commit()
            db.refresh(existing)
            return existing, False

    # Create new partial session
    new_session_id = session_id or str(uuid.uuid4())
    new_resp = models.Response(
        form_id=form.id,
        session_id=new_session_id,
        respondent_id=respondent_id or str(uuid.uuid4()),
        completion_status="partial",
        started_at=datetime.datetime.utcnow(),
        last_activity_at=datetime.datetime.utcnow(),
        time_spent_seconds=0,
    )
    db.add(new_resp)
    db.commit()
    db.refresh(new_resp)
    return new_resp, True


def save_session_progress(
    db: Session,
    share_id: str,
    session_id: str,
    answers: List[schemas.AnswerSubmission],
    last_question_id: Optional[int] = None,
    time_spent_increment: int = 0
) -> models.Response:
    form = get_form_by_share_id(db, share_id)
    if not form:
        raise ValueError("Form not found")

    resp = db.query(models.Response).filter(
        models.Response.session_id == session_id,
        models.Response.form_id == form.id
    ).first()

    if not resp:
        resp, _ = init_or_resume_session(db, share_id, session_id=session_id)

    resp.last_activity_at = datetime.datetime.utcnow()
    if last_question_id is not None:
        resp.last_question_id = last_question_id
    if time_spent_increment > 0:
        resp.time_spent_seconds = (resp.time_spent_seconds or 0) + time_spent_increment

    existing_answers = {a.question_id: a for a in resp.answers}
    for ans in answers:
        q = db.query(models.Question).filter(
            models.Question.id == ans.question_id,
            models.Question.form_id == form.id
        ).first()
        if q:
            if ans.question_id in existing_answers:
                existing_answers[ans.question_id].answer_value = ans.answer_value
            else:
                db.add(models.Answer(
                    response_id=resp.id,
                    question_id=ans.question_id,
                    answer_value=ans.answer_value
                ))

    db.commit()
    db.refresh(resp)
    return resp


# --- SUBMISSION CRUD ---
def submit_response(db: Session, share_id: str, submission: schemas.ResponseSubmissionRequest) -> Optional[models.Response]:
    form = get_form_by_share_id(db, share_id)
    if not form:
        return None

    is_open, msg = check_form_availability(form, db)
    if not is_open:
        raise ValueError(msg)

    # Validate required questions, taking into account logic jump skips
    answers_map = {ans.question_id: ans.answer_value for ans in submission.answers}
    active_q_ids = set(get_active_question_ids(form, answers_map))

    for q in form.questions:
        if q.required and q.id in active_q_ids:
            val = answers_map.get(q.id)
            if (
                val is None
                or (isinstance(val, str) and not val.strip())
                or (isinstance(val, list) and len(val) == 0)
                or (isinstance(val, dict) and not val.get("url") and not val.get("filename"))
            ):
                raise ValueError(f"Question '{q.title}' is required.")

    # Check if a partial session already exists for this submission to avoid duplicate entries
    response = None
    if submission.session_id:
        response = db.query(models.Response).filter(
            models.Response.session_id == submission.session_id,
            models.Response.form_id == form.id
        ).first()

    if response:
        response.completion_status = "completed"
        response.submitted_at = datetime.datetime.utcnow()
        response.last_activity_at = datetime.datetime.utcnow()
        if submission.respondent_id:
            response.respondent_id = submission.respondent_id
        if submission.time_spent_seconds:
            response.time_spent_seconds = submission.time_spent_seconds

        existing_answers = {a.question_id: a for a in response.answers}
        for ans in submission.answers:
            if ans.question_id in existing_answers:
                existing_answers[ans.question_id].answer_value = ans.answer_value
            else:
                db.add(models.Answer(
                    response_id=response.id,
                    question_id=ans.question_id,
                    answer_value=ans.answer_value,
                ))
    else:
        # Create new response record
        response = models.Response(
            form_id=form.id,
            session_id=submission.session_id or str(uuid.uuid4()),
            respondent_id=submission.respondent_id or str(uuid.uuid4()),
            completion_status="completed",
            submitted_at=datetime.datetime.utcnow(),
            started_at=datetime.datetime.utcnow(),
            last_activity_at=datetime.datetime.utcnow(),
            time_spent_seconds=submission.time_spent_seconds or 0,
        )
        db.add(response)
        db.flush()

        for ans in submission.answers:
            q = db.query(models.Question).filter(
                models.Question.id == ans.question_id,
                models.Question.form_id == form.id
            ).first()
            if q:
                db.add(models.Answer(
                    response_id=response.id,
                    question_id=ans.question_id,
                    answer_value=ans.answer_value,
                ))

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
    partial_responses = sum(1 for r in responses if r.completion_status == "partial")
    
    completion_rate = round((completed_responses / total_responses * 100.0), 1) if total_responses > 0 else 0.0
    abandonment_rate = round((partial_responses / total_responses * 100.0), 1) if total_responses > 0 else 0.0

    # Calculate average completion time
    completed_times = [
        r.time_spent_seconds for r in responses
        if r.completion_status == "completed" and r.time_spent_seconds and r.time_spent_seconds > 0
    ]
    avg_seconds = round(sum(completed_times) / len(completed_times), 1) if completed_times else None
    avg_formatted = None
    if avg_seconds is not None:
        if avg_seconds >= 60:
            mins = int(avg_seconds // 60)
            secs = int(avg_seconds % 60)
            avg_formatted = f"{mins}m {secs}s"
        else:
            avg_formatted = f"{int(avg_seconds)}s"

    first_resp = db.query(func.min(models.Response.submitted_at)).filter(models.Response.form_id == form_id).scalar()
    last_resp = db.query(func.max(models.Response.submitted_at)).filter(models.Response.form_id == form_id).scalar()

    # Response trends over time (by date)
    date_buckets: Dict[str, Dict[str, int]] = {}
    for r in responses:
        dt = r.submitted_at or r.started_at
        if dt:
            d_str = dt.strftime("%Y-%m-%d")
            if d_str not in date_buckets:
                date_buckets[d_str] = {"completed": 0, "partial": 0}
            if r.completion_status == "completed":
                date_buckets[d_str]["completed"] += 1
            else:
                date_buckets[d_str]["partial"] += 1

    sorted_dates = sorted(date_buckets.keys())
    response_trends = [
        {
            "date": d,
            "completed": date_buckets[d]["completed"],
            "partial": date_buckets[d]["partial"],
            "total": date_buckets[d]["completed"] + date_buckets[d]["partial"],
        }
        for d in sorted_dates
    ]

    questions_analytics = []
    for q in form.questions:
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
            "file_count": None,
            "file_list": None,
        }

        if q.type in ["multiple_choice", "dropdown", "yes_no"]:
            counts: Dict[str, int] = {}
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

        elif q.type == "file_upload":
            files = []
            for val in valid_answers:
                if isinstance(val, dict) and (val.get("url") or val.get("filename")):
                    files.append({
                        "filename": val.get("filename", "Uploaded File"),
                        "url": val.get("url", ""),
                        "size_formatted": val.get("size_formatted", "")
                    })
            q_stat["file_count"] = len(files)
            q_stat["file_list"] = files[-10:]

        else:
            # text, email, long_text
            text_vals = [str(val) for val in valid_answers if str(val).strip()]
            q_stat["recent_answers"] = text_vals[-20:]

        questions_analytics.append(q_stat)

    return {
        "form_id": form.id,
        "form_title": form.title,
        "total_responses": total_responses,
        "completed_responses": completed_responses,
        "partial_responses": partial_responses,
        "completion_rate": completion_rate,
        "abandonment_rate": abandonment_rate,
        "average_completion_time_seconds": avg_seconds,
        "average_completion_time_formatted": avg_formatted,
        "first_response_at": first_resp,
        "last_response_at": last_resp,
        "response_trends": response_trends,
        "questions": questions_analytics,
    }


def export_responses_csv(db: Session, form_id: int) -> str:
    form = get_form(db, form_id)
    if not form:
        return ""

    responses = db.query(models.Response).filter(
        models.Response.form_id == form_id
    ).order_by(models.Response.submitted_at).all()
    questions = form.questions

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Header
    headers = [
        "Response ID",
        "Session ID",
        "Respondent ID",
        "Started At",
        "Submitted At",
        "Time Spent (s)",
        "Completion Status",
    ]
    for q in questions:
        headers.append(f"{q.title} ({q.type})")
    writer.writerow(headers)

    # Rows
    for resp in responses:
        answers_dict = {a.question_id: a.answer_value for a in resp.answers}
        row = [
            resp.id,
            resp.session_id or "",
            resp.respondent_id or "Anonymous",
            resp.started_at.isoformat() if resp.started_at else "",
            resp.submitted_at.isoformat() if resp.submitted_at else "",
            resp.time_spent_seconds or 0,
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
