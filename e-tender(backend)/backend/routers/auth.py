from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from datetime import timedelta

from .. import models, schemas, security
from ..database import get_db
from ..security import oauth2_scheme, decode_access_token

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

# --- SIGNUP ---
@router.post("/signup", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def signup(data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Sign up a new user (Vendor or Institute Admin)."""
    # Check existing user
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Hash password
    hashed_password = security.get_password_hash(data.password)

    # Fetch role
    try:
        role_name = data.role.upper()
        user_role = db.query(models.Role).filter(models.Role.role_name == role_name).one()
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role '{data.role}' does not exist.")

    try:
        # Create user
        new_user = models.User(
            username=data.username,
            email=data.email,
            hashed_password=hashed_password,
        )
        new_user.roles.append(user_role)
        db.add(new_user)
        db.flush()  # assign user_id

        # Role-specific logic
        if role_name == "VENDOR":
            if not data.company_name:
                raise HTTPException(status_code=400, detail="company_name is required for vendors")
            new_vendor = models.Vendor(
                company_name=data.company_name,
                gst_number=data.gst_number,
                pan_number=data.pan_number,
                user_id=new_user.user_id
            )
            db.add(new_vendor)

        elif role_name == "INSTITUTE_ADMIN":
            if not data.institute_name:
                raise HTTPException(status_code=400, detail="institute_name is required for institute admins")
            if not data.contact_email:
                raise HTTPException(status_code=400, detail="contact_email is required for institutes")
            new_institute = models.Institute(
                institute_name=data.institute_name,
                address=data.address,
                contact_email=data.contact_email,
                phone_number=data.phone_number,
                registration_number=data.registration_number,
                user_id=new_user.user_id
            )
            db.add(new_institute)

        db.commit()
        db.refresh(new_user)
        return new_user

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred during signup: {str(e)}")

# --- LOGIN ---
@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with email/username for Users OR username for Department. Returns JWT token."""

    # Try user login first
    user = db.query(models.User).filter(
        (models.User.username == form_data.username) | 
        (models.User.email == form_data.username)
    ).first()

    if user and security.verify_password(form_data.password, user.hashed_password):
        token_data = {
            "username": user.username,
            "user_id": user.user_id,
            "roles": [role.role_name for role in user.roles]
        }

    else:
        # Try department login independently (no User table required)
        dept = db.query(models.Department).filter(models.Department.username == form_data.username).first()
        if not dept or not security.verify_password(form_data.password, dept.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username/email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token_data = {
            "username": dept.username,          # department username
            "dept_id": dept.dept_id,            # use dept_id instead of user_id
            "roles": ["DEPARTMENT"],
            "institute_id": dept.institute_id   # optional extra info
        }

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data=token_data, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}



from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import oauth2_scheme, decode_access_token

@router.get("/me", response_model=schemas.TokenData)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Return full current user info, including roles and institute/vendor details"""
    try:
        payload = decode_access_token(token)
        user_id = payload.get("user_id")
        user = db.query(models.User).filter(models.User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Base info
        data = {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "roles": [role.role_name for role in user.roles],
            "password": None,
            "company_name": None,
            "gst_number": None,
            "pan_number": None,
            "institute_name": None,
            "contact_email": None,
            "address": None,
            "phone_number": None,
            "registration_number": None,
        }

        # Vendor info
        if any(r.role_name == "VENDOR" for r in user.roles):
            vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user.user_id).first()
            if vendor:
                data.update({
                    "company_name": vendor.company_name,
                    "gst_number": vendor.gst_number,
                    "pan_number": vendor.pan_number,
                })

        # Institute Admin info
        if any(r.role_name == "INSTITUTE_ADMIN" for r in user.roles):
            institute = db.query(models.Institute).filter(models.Institute.user_id == user.user_id).first()
            if institute:
                data.update({
                    "institute_name": institute.institute_name,
                    "contact_email": institute.contact_email,
                    "address": institute.address,
                    "phone_number": institute.phone_number,
                    "registration_number": institute.registration_number,
                })

        return data

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

# --- DEPENDENCIES ---
def get_current_institute_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    user = db.query(models.User).filter(models.User.user_id == payload['user_id']).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if 'INSTITUTE_ADMIN' not in [role.role_name for role in user.roles]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

def get_current_department(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the currently logged-in department from JWT token."""
    payload = decode_access_token(token)
    
    dept_id = payload.get("dept_id")
    if not dept_id:
        raise HTTPException(status_code=401, detail="Invalid token for department")

    dept = db.query(models.Department).filter(models.Department.dept_id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=401, detail="Department not found")

    return dept


from fastapi import Body

@router.post("/verify-admin-password")
def verify_admin_password(
    password: str = Body(..., embed=True),
    current_admin: models.User = Depends(get_current_institute_admin),
    db: Session = Depends(get_db)
):
    """
    Verify the current institute admin's password.
    Used before showing sensitive information like department passwords.
    """
    if not current_admin.hashed_password:
        raise HTTPException(status_code=400, detail="No password set for this admin")

    if not security.verify_password(password, current_admin.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {"message": "Password verified successfully"}


# --- GET CURRENT VENDOR ---
@router.get("/vendor/me", response_model=schemas.TokenData)
def get_current_vendor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Returns the currently logged-in vendor as a SQLAlchemy Vendor object.
    """
    try:
        payload = decode_access_token(token)
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        vendor = db.query(models.Vendor).filter(models.Vendor.user_id == user_id).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")

        return vendor  # <-- Return the Vendor model instance, not dict

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")

def get_current_user_model(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    payload = decode_access_token(token)
    user = db.query(models.User).filter(models.User.user_id == payload['user_id']).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_optional_vendor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        return None
    return db.query(models.Vendor).filter(models.Vendor.user_id == user_id).first()

