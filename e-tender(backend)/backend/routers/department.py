from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import get_current_institute_admin, get_current_department
from passlib.context import CryptContext
import random, string

router = APIRouter(
    prefix="/api/v1/departments",
    tags=["Departments"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def generate_random_password(length=8):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def generate_unique_username(db: Session, base_name: str):
    while True:
        username = f"{base_name.lower().replace(' ','')}_{random.randint(100,999)}"
        if not db.query(models.Department).filter(models.Department.username == username).first():
            return username

@router.post("/", response_model=schemas.Department, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_institute_admin)
):
    """Create a department without creating a separate User"""

    # Get institute of the current admin
    institute = db.query(models.Institute).filter(
        models.Institute.user_id == current_user.user_id
    ).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    # Generate username/password if not provided
    username = dept_in.username or generate_unique_username(db, dept_in.dept_name)
    password = dept_in.password or generate_random_password()
    hashed_password = get_password_hash(password)

    # Check for duplicate department name or username in the same institute
    duplicate = db.query(models.Department).filter(
        models.Department.institute_id == institute.institute_id,
        (models.Department.dept_name == dept_in.dept_name) | (models.Department.username == username)
    ).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Department name or username already exists")

    # Create Department
    new_dept = models.Department(
        dept_name=dept_in.dept_name,
        institute_id=institute.institute_id,
        username=username,
        hashed_password=hashed_password,
        department_head_name=dept_in.department_head_name,
        plain_password=password
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)

    return {
        "dept_id": new_dept.dept_id,
        "dept_name": new_dept.dept_name,
        "institute_id": new_dept.institute_id,
        "username": username,
        "password": password,  # only return once
        "department_head_name": new_dept.department_head_name,
        "institute": institute
    }


# --- List all departments for institute admin ---
@router.get("/", response_model=list[schemas.Department])
def get_departments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_institute_admin)
):
    institute = db.query(models.Institute).filter(models.Institute.user_id == current_user.user_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    departments = db.query(models.Department).filter(models.Department.institute_id == institute.institute_id).all()
    return [
        {
            "dept_id": d.dept_id,
            "dept_name": d.dept_name,
            "institute_id": d.institute_id,
            "username": d.username,
            "password": d.plain_password,
            "department_head_name": d.department_head_name,
            "institute": institute
        }
        for d in departments
    ]

# --- Get institute info for logged-in department ---
@router.get("/my-institute")
def get_my_institute(
    db: Session = Depends(get_db),
    current_dept: models.Department = Depends(get_current_department)
):
    # Get the institute of the department
    institute = db.query(models.Institute).filter(
        models.Institute.institute_id == current_dept.institute_id
    ).first()

    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    return {
        "institute_id": institute.institute_id,
        "institute_name": institute.institute_name,
        "contact_email": institute.contact_email,
        "phone_number": institute.phone_number,
        "address": institute.address,
        "registration_number": institute.registration_number
    }

# --- Get current department info ---
@router.get("/current", response_model=schemas.Department)
def get_current_department_info(
    current_dept: models.Department = Depends(get_current_department)
):
    """
    Fetch details of the currently logged-in department.
    Department is authenticated via some token/session, not as a User.
    """
    return {
        "dept_id": current_dept.dept_id,
        "dept_name": current_dept.dept_name,
        "username": current_dept.username,
        "department_head_name": current_dept.department_head_name,
        "institute_id": current_dept.institute_id,
        "password": current_dept.plain_password,  # optional, if needed
    }
