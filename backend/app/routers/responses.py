from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import crud, schemas

router = APIRouter(prefix="/api/forms", tags=["responses"])


@router.get("/{form_id}/responses", response_model=List[schemas.ResponseDetail])
def get_form_responses(form_id: int, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.get_form_responses(db, form_id)


@router.get("/{form_id}/responses/{response_id}", response_model=schemas.ResponseDetail)
def get_response_detail(form_id: int, response_id: int, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    resp = crud.get_response_detail(db, response_id)
    if not resp or resp["form_id"] != form_id:
        raise HTTPException(status_code=404, detail="Response not found")
    return resp
