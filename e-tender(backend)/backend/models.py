import enum
from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Text, Enum as SQLAlchemyEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# --- Enums ---
class TenderStatus(enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    OPEN = "open_for_bidding"
    EVALUATION = "under_evaluation"
    AWARDED = "awarded"
    CANCELLED = "cancelled"
    CLOSED = "closed"

class BidStatus(enum.Enum):
    SUBMITTED = "submitted"
    WITHDRAWN = "withdrawn"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    AWARDED = "awarded"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class VerificationStatus(enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

# --- Association Tables ---
class UserRole(Base):
    __tablename__ = 'user_roles'
    user_id = Column(Integer, ForeignKey('users.user_id'), primary_key=True)
    role_id = Column(Integer, ForeignKey('roles.role_id'), primary_key=True)
    user = relationship("User", back_populates="role_associations")
    role = relationship("Role", back_populates="user_associations")

class CommitteeMember(Base):
    __tablename__ = 'committee_members'
    user_id = Column(Integer, ForeignKey('users.user_id'), primary_key=True)
    committee_id = Column(Integer, ForeignKey('evaluation_committees.committee_id'), primary_key=True)
    assigned_date = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="committee_assignments")
    committee = relationship("EvaluationCommittee", back_populates="members")

# --- Core Models ---
class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_associations = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    roles = relationship(
        "Role",
        secondary="user_roles",
        back_populates="users",
        overlaps="role_associations,user"
    )
    institute = relationship("Institute", back_populates="user", uselist=False, cascade="all, delete-orphan")
    committee_assignments = relationship("CommitteeMember", back_populates="user")
    vendor = relationship("Vendor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    overlaps="role_associations,user" 

class Role(Base):
    __tablename__ = 'roles'
    role_id = Column(Integer, primary_key=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    user_associations = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")
    users = relationship(
        "User",
        secondary="user_roles",
        back_populates="roles",
        overlaps="user_associations,users"
    )

class Institute(Base):
    __tablename__ = 'institutes'
    institute_id = Column(Integer, primary_key=True, index=True)
    institute_name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=False, unique=True)
    phone_number = Column(String(20), nullable=True)
    registration_number = Column(String(100), unique=True, nullable=True)
    verification_status = Column(SQLAlchemyEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id'), unique=True, nullable=False)
    user = relationship("User", back_populates="institute")
    departments = relationship("Department", back_populates="institute", cascade="all, delete-orphan")

class Department(Base):
    __tablename__ = 'departments'
    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String(255), nullable=False)
    institute_id = Column(Integer, ForeignKey('institutes.institute_id'))
    institute = relationship("Institute", back_populates="departments")
    tenders = relationship("Tender", back_populates="department")
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    department_head_name = Column(String, nullable=True) 
    plain_password = Column(String(100), nullable=True) 

class Vendor(Base):
    __tablename__ = 'vendors'
    vendor_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    gst_number = Column(String(15), unique=True, nullable=True)
    pan_number = Column(String(10), unique=True, nullable=True)
    verification_status = Column(SQLAlchemyEnum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    contact_person = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), unique=True, nullable=False)
    user = relationship("User", back_populates="vendor")
    bids = relationship("Bid", back_populates="vendor")
    clarifications = relationship("Clarification", back_populates="vendor")
    emds = relationship("EMD", back_populates="vendor")

# --- Remaining models unchanged except adding String lengths ---
class EvaluationCommittee(Base):
    __tablename__ = 'evaluation_committees'
    committee_id = Column(Integer, primary_key=True, index=True)
    committee_name = Column(String(255), nullable=False)
    members = relationship("CommitteeMember", back_populates="committee")
    bids_evaluated = relationship("Bid", back_populates="evaluation_committee")

class TenderCategory(Base):
    __tablename__ = 'tender_categories'
    category_id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(255), nullable=False, unique=True)
    tenders = relationship("Tender", back_populates="category")

class Tender(Base):
    __tablename__ = 'tenders'
    tender_id = Column(Integer, primary_key=True, index=True)
    tender_number = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    estimated_cost = Column(Float)
    submission_deadline = Column(DateTime, nullable=False)
    publish_date = Column(DateTime, default=func.now())
    status = Column(SQLAlchemyEnum(TenderStatus), default=TenderStatus.DRAFT, nullable=False, index=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    dept_id = Column(Integer, ForeignKey('departments.dept_id'))
    category_id = Column(Integer, ForeignKey('tender_categories.category_id'))
    department = relationship("Department", back_populates="tenders")
    category = relationship("TenderCategory", back_populates="tenders")
    documents = relationship("TenderDocument", back_populates="tender", cascade="all, delete-orphan")
    corrigenda = relationship("Corrigendum", back_populates="tender", cascade="all, delete-orphan")
    evaluation_criteria = relationship("EvaluationCriterion", back_populates="tender", cascade="all, delete-orphan")
    emds = relationship("EMD", back_populates="tender")
    bids = relationship("Bid", back_populates="tender")
    clarifications = relationship("Clarification", back_populates="tender")
    history = relationship("TenderHistory", back_populates="tender", cascade="all, delete-orphan")
    is_checked = Column(Boolean, default=False)


class Bid(Base):
    __tablename__ = 'bids'
    bid_id = Column(Integer, primary_key=True, index=True)
    bid_amount = Column(Float, nullable=False)
    submission_date = Column(DateTime, default=func.now())
    bid_status = Column(SQLAlchemyEnum(BidStatus), default=BidStatus.SUBMITTED, nullable=False, index=True)

    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    tender_id = Column(Integer, ForeignKey('tenders.tender_id'))
    vendor_id = Column(Integer, ForeignKey('vendors.vendor_id'))
    committee_id = Column(Integer, ForeignKey('evaluation_committees.committee_id'), nullable=True)

    tender = relationship("Tender", back_populates="bids")
    vendor = relationship("Vendor", back_populates="bids")
    evaluation_committee = relationship("EvaluationCommittee", back_populates="bids_evaluated")
    documents = relationship("BidDocument", back_populates="bid", cascade="all, delete-orphan")
    award = relationship("Award", back_populates="bid", uselist=False, cascade="all, delete-orphan")
    history = relationship("BidHistory", back_populates="bid", cascade="all, delete-orphan")

class TenderDocument(Base):
    __tablename__ = 'tender_documents'
    doc_id = Column(Integer, primary_key=True)
    document_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    upload_date = Column(DateTime, default=func.now())
    tender_id = Column(Integer, ForeignKey('tenders.tender_id'), nullable=False)
    
    tender = relationship("Tender", back_populates="documents")

class BidDocument(Base):
    __tablename__ = 'bid_documents'
    doc_id = Column(Integer, primary_key=True)
    document_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    bid_id = Column(Integer, ForeignKey('bids.bid_id'), nullable=False)
    
    bid = relationship("Bid", back_populates="documents")

class Corrigendum(Base):
    __tablename__ = 'corrigenda'
    corrigendum_id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    publish_date = Column(DateTime, default=func.now())
    tender_id = Column(Integer, ForeignKey('tenders.tender_id'), nullable=False)
    
    tender = relationship("Tender", back_populates="corrigenda")

class EvaluationCriterion(Base):
    __tablename__ = 'evaluation_criteria'
    criterion_id = Column(Integer, primary_key=True)
    description = Column(Text, nullable=False)
    max_score = Column(Integer, nullable=False)
    tender_id = Column(Integer, ForeignKey('tenders.tender_id'), nullable=False)
    
    tender = relationship("Tender", back_populates="evaluation_criteria")

class EMD(Base):
    __tablename__ = 'emds'
    emd_id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String(255), unique=True)
    payment_date = Column(DateTime, default=func.now())
    status = Column(SQLAlchemyEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    tender_id = Column(Integer, ForeignKey('tenders.tender_id'), nullable=False)
    vendor_id = Column(Integer, ForeignKey('vendors.vendor_id'), nullable=False)

    tender = relationship("Tender", back_populates="emds")
    vendor = relationship("Vendor", back_populates="emds")

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    log_id = Column(Integer, primary_key=True)
    action = Column(String(255), nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=True)
    
    user = relationship("User", back_populates="audit_logs")

class Notification(Base):
    __tablename__ = 'notifications'
    notification_id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    
    user = relationship("User", back_populates="notifications")

class Award(Base):
    __tablename__ = 'awards'
    award_id = Column(Integer, primary_key=True)
    award_date = Column(DateTime, default=func.now())
    contract_start_date = Column(DateTime)
    contract_end_date = Column(DateTime)
    bid_id = Column(Integer, ForeignKey('bids.bid_id'), unique=True)

    # Soft Delete fields
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    
    bid = relationship("Bid", back_populates="award")
    payments = relationship("Payment", back_populates="award", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = 'payments'
    payment_id = Column(Integer, primary_key=True)
    amount = Column(Float, nullable=False)
    payment_date = Column(DateTime, default=func.now())
    status = Column(SQLAlchemyEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    payment_method = Column(String(50))
    transaction_id = Column(String(255), unique=True)
    award_id = Column(Integer, ForeignKey('awards.award_id'))
    
    award = relationship("Award", back_populates="payments")

class Clarification(Base):
    __tablename__ = 'clarifications'
    clarification_id = Column(Integer, primary_key=True)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text)
    question_date = Column(DateTime, default=func.now())
    answer_date = Column(DateTime)
    
    tender_id = Column(Integer, ForeignKey('tenders.tender_id'), index=True)
    vendor_id = Column(Integer, ForeignKey('vendors.vendor_id'), index=True)
    
    tender = relationship("Tender", back_populates="clarifications")
    vendor = relationship("Vendor", back_populates="clarifications")


# --- History Tracking Models ---

class TenderHistory(Base):
    """Tracks changes to a Tender for audit purposes."""
    __tablename__ = 'tender_history'
    history_id = Column(Integer, primary_key=True)
    version = Column(Integer, nullable=False)
    changed_at = Column(DateTime, default=func.now())
    tender_id = Column(Integer, ForeignKey('tenders.tender_id'), nullable=False)
    
    # Mirrored fields from Tender
    title = Column(String(255))
    description = Column(Text)
    submission_deadline = Column(DateTime)
    status = Column(SQLAlchemyEnum(TenderStatus))

    tender = relationship("Tender", back_populates="history")

class BidHistory(Base):
    """Tracks changes to a Bid for audit purposes."""
    __tablename__ = 'bid_history'
    history_id = Column(Integer, primary_key=True)
    version = Column(Integer, nullable=False)
    changed_at = Column(DateTime, default=func.now())
    bid_id = Column(Integer, ForeignKey('bids.bid_id'), nullable=False)

    # Mirrored fields from Bid
    bid_amount = Column(Float)
    bid_status = Column(SQLAlchemyEnum(BidStatus))

    bid = relationship("Bid", back_populates="history")
