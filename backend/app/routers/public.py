import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import crud, schemas

router = APIRouter(prefix="/api/public/forms", tags=["public"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@router.get("/{share_id}", response_model=schemas.PublicFormResponse)
def get_public_form(share_id: str, db: Session = Depends(get_db)):
    form = crud.get_form_by_share_id(db, share_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    is_open, msg = crud.check_form_availability(form, db)
    if not is_open:
        raise HTTPException(status_code=403, detail=msg)

    # Sort questions by position
    sorted_questions = sorted(form.questions, key=lambda q: q.position)

    return {
        "title": form.title,
        "description": form.description or "",
        "share_id": form.share_id,
        "theme_config": form.theme_config or {},
        "welcome_screen": form.welcome_screen or {},
        "thank_you_screen": form.thank_you_screen or {},
        "settings": form.settings or {},
        "logic_rules": form.logic_rules or [],
        "questions": [
            {
                "id": q.id,
                "title": q.title,
                "description": q.description or "",
                "type": q.type,
                "position": q.position,
                "required": q.required,
                "settings": q.settings or {},
                "logic_rules": q.logic_rules or [],
            }
            for q in sorted_questions
        ],
    }


@router.post("/{share_id}/session", response_model=schemas.SessionInitResponse)
def init_or_resume_session_route(
    share_id: str,
    req: schemas.SessionInitRequest,
    db: Session = Depends(get_db),
):
    try:
        resp, is_new = crud.init_or_resume_session(
            db, share_id, session_id=req.session_id, respondent_id=req.respondent_id
        )
        answers_data = [
            {
                "id": a.id,
                "question_id": a.question_id,
                "question_title": a.question.title if a.question else "",
                "question_type": a.question.type if a.question else "",
                "answer_value": a.answer_value,
                "created_at": a.created_at,
            }
            for a in resp.answers
        ]
        return {
            "session_id": resp.session_id,
            "is_new": is_new,
            "last_question_id": resp.last_question_id,
            "time_spent_seconds": resp.time_spent_seconds or 0,
            "answers": answers_data,
            "completion_status": resp.completion_status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{share_id}/progress")
def save_progress_route(
    share_id: str,
    req: schemas.SessionProgressRequest,
    db: Session = Depends(get_db),
):
    try:
        resp = crud.save_session_progress(
            db,
            share_id=share_id,
            session_id=req.session_id,
            answers=req.answers,
            last_question_id=req.last_question_id,
            time_spent_increment=req.time_spent_increment or 0,
        )
        return {"success": True, "session_id": resp.session_id, "status": resp.completion_status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{share_id}/responses", status_code=status.HTTP_201_CREATED)
def submit_public_response(
    share_id: str,
    submission: schemas.ResponseSubmissionRequest,
    db: Session = Depends(get_db),
):
    form = crud.get_form_by_share_id(db, share_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    is_open, msg = crud.check_form_availability(form, db)
    if not is_open:
        raise HTTPException(status_code=403, detail=msg)

    # Server-side validation with conditional logic jump awareness
    answers_dict = {a.question_id: a.answer_value for a in submission.answers}
    active_q_ids = set(crud.get_active_question_ids(form, answers_dict))

    for q in form.questions:
        val = answers_dict.get(q.id)

        # Check required only if on active path
        if q.required and q.id in active_q_ids:
            if (
                val is None
                or (isinstance(val, str) and not val.strip())
                or (isinstance(val, list) and len(val) == 0)
                or (isinstance(val, dict) and not val.get("url") and not val.get("filename"))
            ):
                raise HTTPException(
                    status_code=422,
                    detail=f"Field '{q.title}' is required.",
                )

        # Check type specific validations
        if val is not None and val != "":
            if q.type == "email":
                if not isinstance(val, str) or not EMAIL_REGEX.match(val.strip()):
                    raise HTTPException(
                        status_code=422,
                        detail=f"Invalid email format for '{q.title}'.",
                    )
            elif q.type == "number":
                try:
                    num_val = float(val)
                    if q.settings and "min" in q.settings and q.settings["min"] is not None:
                        if num_val < float(q.settings["min"]):
                            raise HTTPException(
                                status_code=422,
                                detail=f"'{q.title}' must be at least {q.settings['min']}.",
                            )
                    if q.settings and "max" in q.settings and q.settings["max"] is not None:
                        if num_val > float(q.settings["max"]):
                            raise HTTPException(
                                status_code=422,
                                detail=f"'{q.title}' must be at most {q.settings['max']}.",
                            )
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=422,
                        detail=f"'{q.title}' must be a valid number.",
                    )
            elif q.type == "rating":
                try:
                    r_val = int(val)
                    scale = int(q.settings.get("scale", 5)) if q.settings else 5
                    if r_val < 1 or r_val > scale:
                        raise HTTPException(
                            status_code=422,
                            detail=f"Rating for '{q.title}' must be between 1 and {scale}.",
                        )
                except (ValueError, TypeError):
                    raise HTTPException(
                        status_code=422,
                        detail=f"Rating for '{q.title}' must be a valid integer.",
                    )

    try:
        response = crud.submit_response(db, share_id, submission)
        return {
            "success": True,
            "message": "Response submitted successfully",
            "response_id": response.id,
        }
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

