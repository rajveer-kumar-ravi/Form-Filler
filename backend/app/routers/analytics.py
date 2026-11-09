from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app import crud, schemas

router = APIRouter(prefix="/api/forms", tags=["analytics"])


@router.get("/{form_id}/analytics", response_model=schemas.FormAnalyticsResponse)
def get_analytics(form_id: int, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    analytics = crud.get_form_analytics(db, form_id)
    return analytics


@router.get("/{form_id}/export")
def export_responses(form_id: int, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    csv_data = crud.export_responses_csv(db, form_id)
    filename = f"formflow_{form_id}_{form.title.lower().replace(' ', '_')}_responses.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
