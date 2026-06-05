# routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, crud
from ..dependencies import create_access_token, get_current_user

router = APIRouter(tags=["auth"])

@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # Check if user email is valid: Valid email is "@elizadeuniversity.edu.ng"
    if user.role == models.UserRole.STUDENT and "@elizadeuniversity.edu.ng" not in user.email:
        raise HTTPException(
            status_code=400,
            detail="Invalid email address"
        )

    # Check if matric number is valid: Valid matric number starts with EU
    if user.role == models.UserRole.STUDENT and not user.matrix_number.startswith("EU"): # type: ignore
        raise HTTPException(
            status_code=400,
            detail="Invalid matric number"
        )

    elif not crud.verify_student_email(user.matrix_number, user.email):
        raise HTTPException(status_code=400, detail = "Invalid matric number or email")
    
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    if user.role == models.UserRole.VENDOR and not user.cafeteria_id:
        raise HTTPException(
            status_code=400, 
            detail="Vendors must select a cafeteria during registration"
        )
    
    created_user = crud.create_user(db, user)
    # print("User created:", created_user)

    # Auto login after register
    access_token = create_access_token(data={"sub": user.email, "name": user.full_name, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=user_credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Enforce that the client-selected role matches the server-side role for this account
    if user.role != user_credentials.role: # type:ignore
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is a '{user.role.value}' account. Please switch to the {user.role.value} tab to login."
        )
    
    # Note: This will be replaced with a JSON file check that contains the details of real students. 
    # For now this will work.
    if user.role == models.UserRole.VENDOR: # type: ignore
        if not crud.verify_password(user_credentials.password, user.hashed_password): # type: ignore      
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
    elif user.role == models.UserRole.STUDENT and not user.matrix_number.startswith("EU"): # type: ignore
        typed_matric_number = user_credentials.password
        if user.matrix_number != typed_matric_number: # type: ignore
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect matric number"
            )


    access_token = create_access_token(data={"sub": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role),
        "phone": current_user.phone
    }