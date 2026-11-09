from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import crud, schemas

router = APIRouter(tags=["questions"])


@router.post("/api/forms/{form_id}/questions", response_model=schemas.QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(form_id: int, question_in: schemas.QuestionCreate, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    question = crud.create_question(db, form_id, question_in)
    return question


@router.put("/api/questions/{question_id}", response_model=schemas.QuestionResponse)
def update_question(question_id: int, question_update: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    question = crud.update_question(db, question_id, question_update)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.delete("/api/questions/{question_id}", status_code=status.HTTP_200_OK)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    success = crud.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully", "id": question_id}


@router.put("/api/forms/{form_id}/questions/reorder", status_code=status.HTTP_200_OK)
def reorder_questions(form_id: int, reorder_request: schemas.QuestionReorderRequest, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    crud.reorder_questions(db, form_id, reorder_request.questions)
    return {"message": "Questions reordered successfully"}
