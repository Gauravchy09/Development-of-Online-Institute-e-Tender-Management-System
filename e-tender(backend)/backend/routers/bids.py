# routers/bids.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from .auth import get_current_vendor, get_current_user_model

router = APIRouter(
    prefix="/api/v1/bids",
    tags=["Bids"]
)

UPLOAD_DIR = "uploads/bids"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# --- CREATE A BID AND UPDATE TENDER ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_bid(
    bid: schemas.BidCreate,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor)
):
    """
    Create a bid for the logged-in vendor and update the Tender table.
    """
    # Step 1: Fetch the tender
    tender = db.query(models.Tender).filter(
        models.Tender.tender_id == bid.tender_id,
        models.Tender.is_checked == True,
        models.Tender.is_deleted == False
    ).first()

    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found or not open for bidding")

    # Step 2: Check if vendor already submitted a bid
    existing_bid = db.query(models.Bid).filter(
        models.Bid.tender_id == bid.tender_id,
        models.Bid.vendor_id == vendor.vendor_id,
        models.Bid.is_deleted == False
    ).first()
    if existing_bid:
        raise HTTPException(status_code=400, detail="You have already submitted a bid for this tender")

    # Step 3: Create bid
    new_bid = models.Bid(
        bid_amount=bid.bid_amount,
        tender_id=bid.tender_id,
        vendor_id=vendor.vendor_id
    )
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)

    # Step 4: Update tender info (optional: you can track bid count, last bid, etc.)
    tender.bids.append(new_bid)  # if Tender has relationship with Bid
    db.commit()
    db.refresh(tender)

    # Step 5: Return response including updated tender info
    return {
        "bid": new_bid,
        "tender": {
            "tender_id": tender.tender_id,
            "tender_number": tender.tender_number,
            "title": tender.title,
            "estimated_cost": tender.estimated_cost,
            "submission_deadline": tender.submission_deadline,
            "status": tender.status,
            "userBidSubmitted": True,
            "bids_received": len(tender.bids)
        }
    }

# --- GET ALL BIDS FOR LOGGED-IN VENDOR ---
@router.get("/", response_model=List[schemas.Bid])
def get_bids(
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor)
):
    """
    Get all bids submitted by the logged-in vendor.
    """
    bids = db.query(models.Bid).filter(
        models.Bid.vendor_id == vendor.vendor_id,
        models.Bid.is_deleted == False
    ).all()
    return bids


# --- GET SINGLE BID ---
@router.get("/{bid_id}", response_model=schemas.Bid)
def get_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor)
):
    bid = db.query(models.Bid).filter(
        models.Bid.bid_id == bid_id,
        models.Bid.vendor_id == vendor.vendor_id,
        models.Bid.is_deleted == False
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    return bid


# --- UPDATE BID STATUS (restricted to vendor) ---
@router.patch("/{bid_id}/status", response_model=schemas.Bid)
def update_bid_status(
    bid_id: int,
    status_update: schemas.Bid,  # or create a BidStatusUpdate schema
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor)
):
    bid = db.query(models.Bid).filter(
        models.Bid.bid_id == bid_id,
        models.Bid.vendor_id == vendor.vendor_id,
        models.Bid.is_deleted == False
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    bid.bid_status = status_update.bid_status
    db.commit()
    db.refresh(bid)
    return bid


# --- ADD BID DOCUMENT ---
@router.post("/{bid_id}/documents/", response_model=schemas.BidDocument)
def add_bid_document(
    bid_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor)
):
    bid = db.query(models.Bid).filter(
        models.Bid.bid_id == bid_id,
        models.Bid.vendor_id == vendor.vendor_id,
        models.Bid.is_deleted == False
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    # Save file
    filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb+") as f:
        f.write(file.file.read())

    bid_doc = models.BidDocument(
        document_name=file.filename,
        file_path=file_path,
        bid_id=bid.bid_id
    )
    db.add(bid_doc)
    db.commit()
    db.refresh(bid_doc)
    return bid_doc


# --- GET ALL DOCUMENTS OF A BID ---
@router.get("/{bid_id}/documents/", response_model=List[schemas.BidDocument])
def get_bid_documents(
    bid_id: int,
    db: Session = Depends(get_db),
    vendor: models.Vendor = Depends(get_current_vendor)
):
    bid = db.query(models.Bid).filter(
        models.Bid.bid_id == bid_id,
        models.Bid.vendor_id == vendor.vendor_id,
        models.Bid.is_deleted == False
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    return bid.documents

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import os

from .. import models
from ..database import get_db
from ..security import decode_access_token

# Note: The 'router' variable should be defined in your file, for example:
# router = APIRouter(prefix="/api/v1/bids", tags=["Bids"])


# --- Authentication Helper Functions ---
# NOTE: For better organization in larger projects, it's recommended to
#       move these helper functions to a central 'auth.py' or 'security.py' file.

# This security scheme does NOT automatically raise an error if a token is missing.
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_optional_current_user(token: Optional[str] = Depends(optional_oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.User]:
    """
    Tries to get a User from the token. Returns None if the token is missing,
    invalid, or is not for a standard User (i.e., missing 'user_id').
    """
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            return None
        return db.query(models.User).filter(models.User.user_id == user_id).first()
    except Exception:
        # If token is invalid or expired, simply return None
        return None

def get_optional_current_department(token: Optional[str] = Depends(optional_oauth2_scheme), db: Session = Depends(get_db)) -> Optional[models.Department]:
    """
    Tries to get a Department from the token. Returns None if the token is missing,
    invalid, or is not for a Department (i.e., missing 'dept_id').
    """
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        dept_id = payload.get("dept_id")
        if not dept_id:
            return None
        return db.query(models.Department).filter(models.Department.dept_id == dept_id).first()
    except Exception:
        # If token is invalid or expired, simply return None
        return None


# --- API Endpoint ---

@router.get("/documents/{doc_id}/download")
def download_bid_document(
    doc_id: int,
    db: Session = Depends(get_db),
    # Use the flexible, optional dependencies defined above
    current_user: Optional[models.User] = Depends(get_optional_current_user),
    current_dept: Optional[models.Department] = Depends(get_optional_current_department)
):
    """
    Downloads a bid document. Authorizes the document owner (Vendor), the tender
    owner (Department), or an admin of the institute.
    """
    # 1. Find the document and its related tender data
    doc = db.query(models.BidDocument).join(models.Bid).join(models.Tender).filter(
        models.BidDocument.doc_id == doc_id,
        models.Bid.is_deleted == False
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 2. Comprehensive Authorization Logic
    is_authorized = False

    # Rule A: Is the requester the DEPARTMENT that owns the tender?
    if current_dept and doc.bid.tender.dept_id == current_dept.dept_id:
        is_authorized = True

    # Rule B: Is the requester a USER (Vendor or Admin)?
    elif current_user:
        roles = {role.role_name for role in current_user.roles}
        
        # Rule B1: Is it the VENDOR who submitted this specific bid?
        if "VENDOR" in roles and current_user.vendor and doc.bid.vendor_id == current_user.vendor.vendor_id:
            is_authorized = True
            
        # Rule B2: Is it an INSTITUTE ADMIN from the correct institute?
        elif "INSTITUTE_ADMIN" in roles and current_user.institute and doc.bid.tender.department.institute_id == current_user.institute.institute_id:
            is_authorized = True

    # 3. If no authorization rule was met, deny access
    if not is_authorized:
        raise HTTPException(status_code=403, detail="You are not authorized to access this document")
    
    # 4. Check if the file exists on disk and return it
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File does not exist on the server")

    return FileResponse(
        path=doc.file_path,
        filename=doc.document_name,
        media_type='application/octet-stream'
    )