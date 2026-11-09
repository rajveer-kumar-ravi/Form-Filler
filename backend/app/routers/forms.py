from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import crud, schemas

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.get("", response_model=List[schemas.FormListItem])
def list_forms(
    search: Optional[str] = Query(None, description="Search by title"),
    status: Optional[str] = Query(None, description="Filter by status ('draft' | 'published' | 'all')"),
    db: Session = Depends(get_db),
):
    user = crud.get_or_create_default_user(db)
    return crud.get_forms(db, user_id=user.id, search=search, status=status)


@router.post("", response_model=schemas.FormDetailResponse, status_code=status.HTTP_201_CREATED)
def create_form(form_in: schemas.FormCreate, db: Session = Depends(get_db)):
    user = crud.get_or_create_default_user(db)
    form = crud.create_form(db, form_in, user_id=user.id)
    return form


@router.get("/{form_id}", response_model=schemas.FormDetailResponse)
def get_form(form_id: int, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Calculate response count
    resp_count = len(form.responses)
    form_dict = schemas.FormDetailResponse.model_validate(form)
    form_dict.response_count = resp_count
    return form_dict


@router.put("/{form_id}", response_model=schemas.FormDetailResponse)
def update_form(form_id: int, form_update: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = crud.update_form(db, form_id, form_update)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.delete("/{form_id}", status_code=status.HTTP_200_OK)
def delete_form(form_id: int, db: Session = Depends(get_db)):
    success = crud.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted successfully", "id": form_id}


@router.post("/{form_id}/duplicate", response_model=schemas.FormDetailResponse)
def duplicate_form(form_id: int, db: Session = Depends(get_db)):
    new_form = crud.duplicate_form(db, form_id)
    if not new_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return new_form


@router.post("/{form_id}/publish", response_model=schemas.FormDetailResponse)
def publish_form(form_id: int, db: Session = Depends(get_db)):
    form = crud.set_form_status(db, form_id, "published")
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.post("/{form_id}/unpublish", response_model=schemas.FormDetailResponse)
def unpublish_form(form_id: int, db: Session = Depends(get_db)):
    form = crud.set_form_status(db, form_id, "draft")
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form
