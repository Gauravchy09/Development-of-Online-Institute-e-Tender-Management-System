from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Import Enums from models to ensure consistency
from .models import TenderStatus, BidStatus, PaymentStatus, VerificationStatus


# --- TOKEN SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    email: Optional[str] = None
    roles: List[str] = []
    password: Optional[str] = None  # optional, usually None
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    institute_name: Optional[str] = None
    contact_email: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    registration_number: Optional[str] = None



# --- ROLE SCHEMAS ---
class RoleBase(BaseModel):
    role_name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class Role(RoleBase):
    role_id: int

    class Config:
        from_attributes = True


# --- USER SCHEMAS ---
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(BaseModel):
    """
    Unified schema for signup.
    Role can be 'VENDOR' or 'INSTITUTE_ADMIN'.
    """
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8)  # enforce strong password
    role: str

    # Vendor fields
    company_name: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

    # Institute fields
    institute_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None   # ✅ added
    address: Optional[str] = None
    phone_number: Optional[str] = None
    registration_number: Optional[str] = None



# --- ROLE-SPECIFIC SIGNUP SCHEMAS (Optional, if you want separate endpoints) ---
class VendorSignup(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8)

    company_name: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

    # ✅ extra fields
    contact_person: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None



class InstituteSignup(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    institute_name: str
    address: Optional[str] = None
    contact_email: EmailStr
    phone_number: Optional[str] = None
    registration_number: Optional[str] = None



# --- USER RESPONSE SCHEMA ---
class User(UserBase):
    user_id: int
    roles: List[Role] = []

    class Config:
        from_attributes = True


# --- INSTITUTE ---
class InstituteBase(BaseModel):
    institute_name: str
    address: Optional[str] = None
    contact_email: EmailStr
    phone_number: Optional[str] = None
    registration_number: Optional[str] = None


class InstituteCreate(InstituteBase):
    user_id: int   # link to User table


class Institute(InstituteBase):
    institute_id: int
    verification_status: VerificationStatus
    user: User   # include nested User response

    class Config:
        from_attributes = True



# --- DEPARTMENT ---

# from .institute import Institute  # make sure you import this

class DepartmentBase(BaseModel):
    dept_name: str
    institute_id: int
    department_head_name: Optional[str] = None
    institute: Optional["Institute"] = None  # make optional to avoid validation errors

class DepartmentCreate(DepartmentBase):
    username: Optional[str] = None
    password: Optional[str] = None  # optional, will be generated if not provided

    class Config:
        orm_mode = True  # corrected from 'form_attribute'

class Department(DepartmentBase):
    dept_id: int
    username: str
    password: Optional[str] = None  # only returned once on creation

    class Config:
        orm_mode = True


# --- TENDER CATEGORY ---
class TenderCategoryBase(BaseModel):
    category_name: str


class TenderCategoryCreate(TenderCategoryBase):
    pass


class TenderCategory(TenderCategoryBase):
    category_id: int

    class Config:
        from_attributes = True

class TenderCreate(BaseModel):
    tender_number: str
    title: str
    description: Optional[str] = None
    estimated_cost: Optional[float] = None
    submission_deadline: datetime
    category_id: int
    category_name: Optional[str] = None
    dept_id: Optional[int] = None  # set from JWT
    is_checked: Optional[bool] = False

    class Config:
        orm_mode = True


# --- VENDOR ---
class VendorBase(BaseModel):
    company_name: str
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None

    # ✅ new fields
    contact_person: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None



class VendorCreate(VendorBase):
    user_id: int


class Vendor(VendorBase):
    vendor_id: int
    verification_status: VerificationStatus
    user: User

    class Config:
        from_attributes = True


# --- EVALUATION COMMITTEE ---
class EvaluationCommitteeBase(BaseModel):
    committee_name: str


class EvaluationCommitteeCreate(EvaluationCommitteeBase):
    pass


class EvaluationCommittee(EvaluationCommitteeBase):
    committee_id: int
    members: List["CommitteeMember"] = []

    class Config:
        from_attributes = True


# In your schemas.py

# --- TENDER DOCUMENT ---
class TenderDocumentBase(BaseModel):
    document_name: str

class TenderDocumentCreate(TenderDocumentBase):
    # This schema is for creating a record AFTER the file is already handled
    tender_id: int
    file_path: str # The path is determined by the server, not the client

class TenderDocument(TenderDocumentBase):
    doc_id: int
    upload_date: datetime
    tender_id: int
    # DON'T expose the raw file path.
    # file_path: str <-- REMOVE THIS

    # Instead, you can add a download URL if you want, but the client can construct it
    # from the doc_id. The main thing is to NOT expose the server path.

    class Config:
        from_attributes = True


# --- CORRIGENDUM ---
class CorrigendumBase(BaseModel):
    title: str
    details: str


class CorrigendumCreate(CorrigendumBase):
    tender_id: int


class Corrigendum(CorrigendumBase):
    corrigendum_id: int
    publish_date: datetime
    tender_id: int

    class Config:
        from_attributes = True


# --- EVALUATION CRITERION ---
class EvaluationCriterionBase(BaseModel):
    description: str
    max_score: int


class EvaluationCriterionCreate(EvaluationCriterionBase):
    tender_id: int


class EvaluationCriterion(EvaluationCriterionBase):
    criterion_id: int
    tender_id: int

    class Config:
        from_attributes = True


# --- CLARIFICATION ---
class ClarificationBase(BaseModel):
    question_text: str
    answer_text: Optional[str] = None


class ClarificationCreate(ClarificationBase):
    tender_id: int
    vendor_id: int


class Clarification(ClarificationBase):
    clarification_id: int
    question_date: datetime
    answer_date: Optional[datetime] = None
    tender_id: int
    vendor_id: int

    class Config:
        from_attributes = True


# --- EMD ---
class EMDBase(BaseModel):
    amount: float
    transaction_id: str
    status: PaymentStatus = PaymentStatus.PENDING


class EMDCreate(EMDBase):
    tender_id: int
    vendor_id: int


class EMD(EMDBase):
    emd_id: int
    payment_date: datetime
    tender_id: int
    vendor_id: int

    class Config:
        from_attributes = True


# --- TENDER ---
class TenderBase(BaseModel):
    tender_number: str
    title: str
    description: Optional[str] = None
    estimated_cost: Optional[float] = None
    submission_deadline: datetime
    dept_id: int
    category_id: int
    is_checked: bool = False

class Tender(TenderBase):
    tender_id: int
    publish_date: datetime
    status: TenderStatus
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    department: Department
    category: TenderCategory
    documents: List[TenderDocument] = []
    corrigenda: List[Corrigendum] = []
    evaluation_criteria: List[EvaluationCriterion] = []
    clarifications: List[Clarification] = []
    bids: List["Bid"] = []

    class Config:
        from_attributes = True


# # --- BID DOCUMENT ---
# class BidDocumentBase(BaseModel):
#     document_name: str
#     file_path: str


# class BidDocumentCreate(BidDocumentBase):
#     bid_id: int


# class BidDocument(BidDocumentBase):
#     doc_id: int
#     bid_id: int

#     class Config:
#         from_attributes = True


# # --- BID ---
# class BidBase(BaseModel):
#     bid_amount: float
#     tender_id: int


# class BidCreate(BidBase):
#     vendor_id: int


# class Bid(BidBase):
#     bid_id: int
#     submission_date: datetime
#     bid_status: BidStatus
#     is_deleted: bool
#     deleted_at: Optional[datetime] = None
#     committee_id: Optional[int] = None
#     vendor: Vendor
#     documents: List[BidDocument] = []
#     award: Optional["Award"] = None

#     class Config:
#         from_attributes = True

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# --- AWARD (Single Correct Definition) ---
class AwardBase(BaseModel):
    bid_id: int
    contract_start_date: Optional[datetime] = None
    contract_end_date: Optional[datetime] = None

class AwardCreate(AwardBase):
    pass

class Award(AwardBase):
    award_id: int
    award_date: datetime
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    
    # Use Pydantic V2 config
    model_config = ConfigDict(from_attributes=True)


# --- BID DOCUMENT ---
class BidDocumentBase(BaseModel):
    document_name: str

class BidDocumentCreate(BaseModel):
    bid_id: int

class BidDocument(BidDocumentBase):
    doc_id: int
    bid_id: int
    
    model_config = ConfigDict(from_attributes=True)


# --- BID ---
class BidBase(BaseModel):
    bid_amount: float
    tender_id: int

class BidCreate(BidBase):
    pass


class Bid(BidBase):
    bid_id: int
    submission_date: datetime
    bid_status: BidStatus
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    committee_id: Optional[int] = None
    vendor: Vendor
    documents: List[BidDocument] = []
    award: Optional[Award] = None

    class Config:
        from_attributes = True


# --- PAYMENT ---
class PaymentBase(BaseModel):
    amount: float
    payment_method: Optional[str] = None
    transaction_id: str
    award_id: int


class PaymentCreate(PaymentBase):
    pass


class Payment(PaymentBase):
    payment_id: int
    payment_date: datetime
    status: PaymentStatus

    class Config:
        from_attributes = True


# --- COMMITTEE MEMBER ---
class CommitteeMember(BaseModel):
    user_id: int
    committee_id: int
    assigned_date: datetime
    user: User

    class Config:
        from_attributes = True


# --- AUDIT LOG ---
class AuditLogBase(BaseModel):
    action: str
    details: Optional[str] = None
    user_id: Optional[int] = None


class AuditLog(AuditLogBase):
    log_id: int
    timestamp: datetime
    user: Optional[User] = None

    class Config:
        from_attributes = True


# --- NOTIFICATION ---
class NotificationBase(BaseModel):
    message: str
    user_id: int


class Notification(NotificationBase):
    notification_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- TENDER HISTORY ---
class TenderHistoryBase(BaseModel):
    version: int
    title: Optional[str] = None
    description: Optional[str] = None
    submission_deadline: Optional[datetime] = None
    status: Optional[TenderStatus] = None


class TenderHistory(TenderHistoryBase):
    history_id: int
    tender_id: int
    changed_at: datetime

    class Config:
        from_attributes = True


# --- BID HISTORY ---
class BidHistoryBase(BaseModel):
    version: int
    bid_amount: Optional[float] = None
    bid_status: Optional[BidStatus] = None


class BidHistory(BidHistoryBase):
    history_id: int
    bid_id: int
    changed_at: datetime

    class Config:
        from_attributes = True

# ... (all your other existing schema classes) ...

# --- SCHEMAS FOR DETAILED TENDER RESPONSES ---

# A slimmed-down User schema for nested responses
class UserForTender(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    class Config: from_attributes = True

# A Vendor schema for nested responses
class VendorForTender(BaseModel):
    vendor_id: int
    company_name: str
    user: UserForTender
    class Config: from_attributes = True

# An updated Bid schema that includes the vendor and award details
class BidForTender(BidBase): # Inherits from your existing BidBase
    bid_id: int
    submission_date: datetime
    bid_status: BidStatus
    vendor: VendorForTender
    documents: List[BidDocument] = []
    
    # 👇 STEP 1: ADD THIS MISSING LINE
    award: Optional[Award] = None 
    
    class Config:
        from_attributes = True

# The main, detailed response model for a single tender
class TenderWithDetails(Tender): # Inherits from your existing Tender schema
    bids: List[BidForTender] = []
    userBidSubmitted: bool = Field(False, description="True if the current vendor has submitted a bid for this tender")

    class Config:
        from_attributes = True
    

# --- Forward references for nested models ---
Tender.update_forward_refs()
Department.update_forward_refs()
Tender.model_rebuild()
Bid.model_rebuild()
Department.model_rebuild()