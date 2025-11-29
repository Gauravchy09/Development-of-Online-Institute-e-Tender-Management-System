from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/api/v1/tender-categories",
    tags=["Tender Categories"]
)

@router.post("/", response_model=schemas.TenderCategory, status_code=status.HTTP_201_CREATED)
def create_category(category_in: schemas.TenderCategoryCreate, db: Session = Depends(get_db)):
    """Create a new tender category."""

    # Check duplicate
    existing = db.query(models.TenderCategory).filter(
        models.TenderCategory.category_name == category_in.category_name
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Category already exists")

    category = models.TenderCategory(category_name=category_in.category_name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/", response_model=list[schemas.TenderCategory])
def get_categories(db: Session = Depends(get_db)):
    """Get all tender categories."""
    return db.query(models.TenderCategory).all()
