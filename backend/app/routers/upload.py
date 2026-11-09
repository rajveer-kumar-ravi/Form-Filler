import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, status

router = APIRouter(prefix="/api/upload", tags=["upload"])

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB


def format_size(bytes_size: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} GB"


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a PDF or document.",
        )

    # Generate unique filename to avoid collision
    unique_prefix = uuid.uuid4().hex[:8]
    # Sanitize original filename
    safe_basename = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    final_filename = f"{unique_prefix}_{safe_basename}"
    destination_path = os.path.join(UPLOAD_DIR, final_filename)

    try:
        with open(destination_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    size_bytes = os.path.getsize(destination_path)
    if size_bytes > MAX_FILE_SIZE:
        os.remove(destination_path)
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size (15 MB).")

    return {
        "url": f"/uploads/{final_filename}",
        "filename": file.filename,
        "size": size_bytes,
        "size_formatted": format_size(size_bytes),
    }
