from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from .. import models, schemas
from ..database import get_db
from .auth import get_current_institute_admin

router = APIRouter(
    prefix="/api/v1/awards",
    tags=["Awards Management"]
)


@router.post("/", response_model=schemas.Award, status_code=status.HTTP_201_CREATED)
def create_award(
    award_data: schemas.AwardCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_institute_admin)
):
    """
    Creates an Award for a specific bid. This action can only be performed by an Institute Admin.
    This effectively marks a tender as 'awarded' to a specific vendor.
    """
    # 1. Fetch the bid and all related data for validation
    bid_to_award = db.query(models.Bid).join(models.Tender).join(models.Department).filter(
        models.Bid.bid_id == award_data.bid_id
    ).first()

    if not bid_to_award:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bid not found")

    # 2. Authorization Check
    if not current_admin.institute or bid_to_award.tender.department.institute_id != current_admin.institute.institute_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to award bids for this institute's tenders"
        )

    # 3. Business Logic Validations
    if bid_to_award.tender.status == models.TenderStatus.AWARDED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This tender has already been awarded.")
    
    if bid_to_award.tender.submission_deadline > datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot award a bid before the tender's submission deadline has passed.")

    # 4. Perform the transaction: Create Award, Update Bid & Tender Status
    try:
        new_award = models.Award(
            bid_id=award_data.bid_id,
            contract_start_date=award_data.contract_start_date,
            contract_end_date=award_data.contract_end_date,
            award_date=datetime.utcnow()
        )
        db.add(new_award)

        # Update bid and tender
        bid_to_award.bid_status = models.BidStatus.AWARDED
        bid_to_award.tender.status = models.TenderStatus.AWARDED

        # Disqualify losing bids
        losing_bids = db.query(models.Bid).filter(
            models.Bid.tender_id == bid_to_award.tender_id,
            models.Bid.bid_id != bid_to_award.bid_id
        ).all()
        for losing_bid in losing_bids:
            if losing_bid.bid_status == models.BidStatus.SUBMITTED:
                losing_bid.bid_status = models.BidStatus.DISQUALIFIED

        db.commit()
        db.refresh(new_award)

        # ✅ Convert ORM object to Pydantic model before returning
        return schemas.Award.model_validate(new_award)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred while awarding the bid."
        )


@router.get("/", response_model=List[schemas.Award])
def get_all_awards_for_institute(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_institute_admin)
):
    """
    Retrieves all awards for the tenders belonging to the current admin's institute.
    """
    if not current_admin.institute:
        raise HTTPException(status_code=404, detail="Admin is not associated with an institute.")

    awards = db.query(models.Award).join(models.Bid).join(models.Tender).join(models.Department).filter(
        models.Department.institute_id == current_admin.institute.institute_id
    ).all()
    
    # ✅ Convert ORM list to list of Pydantic models
    return [schemas.Award.model_validate(award) for award in awards]
