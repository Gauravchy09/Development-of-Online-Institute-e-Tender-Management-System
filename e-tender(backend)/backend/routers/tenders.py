from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from .. import models, schemas
from ..database import get_db
from .auth import get_current_department, get_current_institute_admin, get_current_user_model, get_optional_vendor

router = APIRouter(
    prefix="/api/v1/tenders",
    tags=["Tenders"]
)
import os
UPLOAD_DIR="uploads/tender"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Create Tender ---
@router.post("/", response_model=schemas.Tender, status_code=status.HTTP_201_CREATED)
def create_tender(
    tender_in: schemas.TenderCreate,
    db: Session = Depends(get_db),
    current_department: models.Department = Depends(get_current_department)
):
    """Create a new tender. Only department users can create tenders."""
    # Check if category exists; create if not
    category = db.query(models.TenderCategory).filter(
        models.TenderCategory.category_name == tender_in.category_name
    ).first()
    if not category:
        category = models.TenderCategory(category_name=tender_in.category_name)
        db.add(category)
        db.commit()
        db.refresh(category)

    # Create tender
    new_tender = models.Tender(
        tender_number=tender_in.tender_number,
        title=tender_in.title,
        description=tender_in.description,
        estimated_cost=tender_in.estimated_cost,
        submission_deadline=tender_in.submission_deadline,
        dept_id=current_department.dept_id,
        category_id=category.category_id,
        publish_date=datetime.utcnow(),
        status=models.TenderStatus.OPEN,
        is_deleted=False,
        is_checked=False
    )
    db.add(new_tender)
    db.commit()
    db.refresh(new_tender)
    return new_tender


# --- Helper function to serialize tender with bids ---
def serialize_award(award):
    if not award:
        return None
    return {
        "award_id": award.award_id,
        "bid_id": award.bid_id,
        "contract_start_date": award.contract_start_date.isoformat() if award.contract_start_date else None,
        "contract_end_date": award.contract_end_date.isoformat() if award.contract_end_date else None,
        "award_date": award.award_date.isoformat() if award.award_date else None,
        "is_deleted": award.is_deleted,
        "deleted_at": award.deleted_at.isoformat() if award.deleted_at else None
    }

def serialize_tender_with_bids(tender):
    return {
        "tender_id": tender.tender_id,
        "tender_number": tender.tender_number,
        "title": tender.title,
        "description": tender.description,
        "estimated_cost": tender.estimated_cost,
        "submission_deadline": tender.submission_deadline.isoformat() if tender.submission_deadline else None,
        "publish_date": tender.publish_date.isoformat() if tender.publish_date else None,
        "status": tender.status.value if hasattr(tender.status, "value") else tender.status,
        "is_checked": tender.is_checked,
        "department": {
            "dept_id": tender.department.dept_id,
            "dept_name": tender.department.dept_name,
            "department_head_name": tender.department.department_head_name,
            "username": getattr(tender.department, "username", None),
            "institute": {
                "institute_id": tender.department.institute.institute_id,
                "institute_name": tender.department.institute.institute_name
            }
        },
        "category": {
            "category_id": tender.category.category_id if tender.category else None,
            "category_name": tender.category.category_name if tender.category else None
        },
        "documents": [
            {
                "document_name": d.document_name,
                "doc_id": d.doc_id
            } for d in tender.documents
        ],
        "corrigenda": [
            {
                "id": c.corrigendum_id if hasattr(c, "corrigendum_id") else None,
                "title": c.title
            } for c in tender.corrigenda
        ],
        "evaluation_criteria": [
            {
                "id": e.criterion_id if hasattr(e, "criterion_id") else None,
                "criterion": e.description if hasattr(e, "description") else None,
                "max_score": e.max_score if hasattr(e, "max_score") else None
            } for e in tender.evaluation_criteria
        ],
        "clarifications": [
            {
                "id": c.clarification_id if hasattr(c, "clarification_id") else None,
                "question": c.question_text if hasattr(c, "question_text") else None,
                "answer": c.answer_text if hasattr(c, "answer_text") else None
            } for c in tender.clarifications
        ],
        "bids": [
            {
                "bid_id": b.bid_id,
                "bid_amount": b.bid_amount,
                "submission_date": b.submission_date.isoformat() if b.submission_date else None,
                "bid_status": b.bid_status.value if hasattr(b.bid_status, "value") else b.bid_status,
                "is_deleted": b.is_deleted,
                "vendor": {
                    "vendor_id": b.vendor.vendor_id,
                    "company_name": b.vendor.company_name,
                    "gst_number": b.vendor.gst_number,
                    "pan_number": b.vendor.pan_number,
                    "user": {
                        "user_id": b.vendor.user.user_id,
                        "username": b.vendor.user.username,
                        "email": b.vendor.user.email
                    }
                },
                "documents": [
                    {
                        "document_name": d.document_name,
                        "doc_id": d.doc_id
                    } for d in b.documents
                ],
                "award": serialize_award(b.award) if hasattr(b, "award") and b.award else None
            } for b in tender.bids if not b.is_deleted
        ]
    }



# --- Fetch tenders by department ---
@router.get("/department/{dept_id}", response_model=List[dict])
def get_tenders_by_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_institute_admin)
):
    """Fetch all tenders from a specific department under your institute (only institute admin)."""
    department = db.query(models.Department).filter(models.Department.dept_id == dept_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    if department.institute_id != current_user.institute.institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this department")

    tenders = db.query(models.Tender).filter(
        models.Tender.dept_id == dept_id,
        models.Tender.is_deleted == False
    ).all()

    return [serialize_tender_with_bids(t) for t in tenders]


# --- Fetch all tenders for an institute ---
@router.get("/institute", response_model=List[dict])
def get_all_tenders_for_institute(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_institute_admin)
):
    """Fetch all tenders across all departments under the institute (only institute admin)."""
    tenders = db.query(models.Tender).join(models.Department).filter(
        models.Department.institute_id == current_user.institute.institute_id,
        models.Tender.is_deleted == False
    ).all()
    return [serialize_tender_with_bids(t) for t in tenders]


# --- Fetch all published tenders (public) ---
@router.get("/all", response_model=List[dict])
def get_all_tenders(
    db: Session = Depends(get_db)
):
    """Fetch all published tenders in the system with bids info."""
    tenders = db.query(models.Tender).filter(
        models.Tender.is_deleted == False,
        models.Tender.is_checked == True
    ).all()
    return [serialize_tender_with_bids(t) for t in tenders]


# --- Publish Tender ---
@router.patch("/{tender_id}/publish", response_model=schemas.Tender)
def publish_tender(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_institute_admin)
):
    """Publish a tender (set is_checked=True) by Institute Admin"""
    tender = db.query(models.Tender).join(models.Department).filter(
        models.Tender.tender_id == tender_id,
        models.Tender.is_deleted == False
    ).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    if not tender.department:
        raise HTTPException(status_code=400, detail="Tender has no department assigned")
    if tender.department.institute_id != current_user.institute.institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized to publish this tender")

    tender.is_checked = True
    db.commit()
    db.refresh(tender)
    return tender


# --- Fetch tenders of the logged-in department ---
@router.get("/my-department", response_model=List[dict])
def get_tenders_of_current_department(
    db: Session = Depends(get_db),
    current_department: models.Department = Depends(get_current_department)
):
    """Fetch all tenders created by the currently logged-in department with bids info."""
    tenders = db.query(models.Tender).filter(
        models.Tender.dept_id == current_department.dept_id,
        models.Tender.is_deleted == False
    ).all()
    return [serialize_tender_with_bids(t) for t in tenders]

from fastapi import UploadFile, File
import shutil
# ... other imports

@router.post("/{tender_id}/documents/", response_model=schemas.TenderDocument)
def upload_tender_document(
    tender_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_department: models.Department = Depends(get_current_department)
):
    """
    Uploads a document for a specific tender.
    This is secure and prevents file overwrites.
    """
    # 1. Authorize the user: Check if the tender exists and belongs to the department.
    tender = db.query(models.Tender).filter(models.Tender.tender_id == tender_id).first()

    if not tender:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tender not found")

    if tender.dept_id != current_department.dept_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to upload documents to this tender"
        )

    # 2. Create a unique and safe filename to prevent overwrites.
    # We prefix the original filename with a timestamp.
    unique_filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # 3. Save the file to disk efficiently and safely.
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        # Ensure the uploaded file's buffer is always closed.
        file.file.close()

    # 4. Create the database record for the document.
    new_document = models.TenderDocument(
        document_name=file.filename,  # Store the original name for user display
        file_path=file_path,          # Store the full path to the unique file
        tender_id=tender_id
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    return new_document # FastAPI will serialize this using your TenderDocument schema

from fastapi.responses import FileResponse
import os
# ... other imports

# (This would be in the same file as your upload function)

@router.get("/documents/{doc_id}/download", response_class=FileResponse)
def download_tender_document(doc_id: int, db: Session = Depends(get_db)):
    """
    Downloads a specific tender document by its unique document ID.
    """
    # 1. Find the document record in the database using its ID.
    document = db.query(models.TenderDocument).filter(models.TenderDocument.doc_id == doc_id).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Document record not found in the database."
        )

    # 2. Check if the physical file actually exists at the path stored in the database.
    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="File not found on the server. It may have been deleted."
        )

    # 3. Stream the file as a response.
    # The 'filename' parameter sets the name the user will see in their download prompt.
    return FileResponse(
        path=document.file_path, 
        filename=document.document_name, 
        media_type='application/octet-stream'
    )

# @router.get("/my-tenders")
# def get_my_tenders(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_user_model),
#     vendor: models.Vendor = Depends(get_optional_vendor)
# ):
#     """
#     Returns tenders visible to the logged-in user:
#     - Vendor: all published tenders
#     - Institute Admin: all tenders of their institute
#     - Department: tenders of their department
#     """
#     query = db.query(models.Tender).join(models.Department)

#     # Vendor: only published tenders
#     if vendor:
#         tenders = query.filter(models.Tender.is_checked == True).all()

#     # Institute admin: tenders of institute
#     elif "INSTITUTE_ADMIN" in [role.role_name for role in current_user.roles]:
#         tenders = query.filter(models.Department.institute_id == current_user.institute.institute_id).all()

#     # Department: tenders of their department
#     elif "DEPARTMENT" in [role.role_name for role in current_user.roles]:
#         dept_id = getattr(current_user, "dept_id", None)
#         if not dept_id:
#             raise HTTPException(status_code=403, detail="Department info missing")
#         tenders = query.filter(models.Tender.department_id == dept_id).all()

#     else:
#         tenders = []

#     return tenders
