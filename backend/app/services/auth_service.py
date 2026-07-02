from flask import session

from app.database.connection import db
from app.models.parent import Parent
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User, UserRole
from app.utils.id_generator import next_student_number, next_teacher_employee_id
from app.utils.captcha import generate_word_captcha_svg
from app.utils.password import hash_password, verify_password
from app.utils.validators import (
    validate_admin_login_payload,
    validate_login_payload,
    validate_signup_payload,
)

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "admin123"
ADMIN_ID = "admin123"
ADMIN_CAPTCHA_SESSION_KEY = "admin_captcha_answer"

ROLE_REDIRECTS = {
    UserRole.STUDENT: "/dashboard/student",
    UserRole.TEACHER: "/dashboard/teacher",
    UserRole.PARENT: "/dashboard/parent",
    UserRole.ADMIN: "/dashboard/admin",
}


def get_redirect_path(role: UserRole) -> str:
    return ROLE_REDIRECTS[role]


def serialize_user(user: User) -> dict:
    data = {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.full_name,
        "role": user.role.value,
        "redirect_to": get_redirect_path(user.role),
    }

    if user.role == UserRole.STUDENT and user.student_profile:
        data["student_number"] = user.student_profile.student_number

    if user.role == UserRole.TEACHER and user.teacher_profile:
        data["employee_id"] = user.teacher_profile.employee_id

    if user.role == UserRole.PARENT and user.parent_profile:
        data["parent_id"] = f"PAR{user.parent_profile.id:03d}"

    return data


def seed_admin_user():
    """Ensure the default admin account exists."""
    existing = User.query.filter_by(email=ADMIN_EMAIL).first()
    if existing:
        return

    admin = User(
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        first_name="System",
        last_name="Admin",
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.session.add(admin)
    db.session.commit()


def signup(data: dict):
    errors, validated = validate_signup_payload(data)
    if errors:
        return None, errors

    if User.query.filter_by(email=validated["email"]).first():
        return None, {"email": "An account with this email already exists"}

    role = validated["role"]

    user = User(
        email=validated["email"],
        password_hash=hash_password(validated["password"]),
        first_name=validated["first_name"],
        last_name=validated["last_name"],
        role=role,
        is_active=True,
    )
    db.session.add(user)
    db.session.flush()

    if role == UserRole.STUDENT:
        db.session.add(
            Student(
                user_id=user.id,
                student_number=next_student_number(),
            )
        )
    elif role == UserRole.TEACHER:
        db.session.add(
            Teacher(
                user_id=user.id,
                employee_id=next_teacher_employee_id(),
            )
        )
    elif role == UserRole.PARENT:
        db.session.add(Parent(user_id=user.id))

    db.session.commit()
    session["user_id"] = user.id

    return serialize_user(user), None


def login(data: dict):
    errors, validated = validate_login_payload(data)
    if errors:
        return None, errors

    user = User.query.filter_by(email=validated["email"]).first()
    if not user or not verify_password(user.password_hash, validated["password"]):
        return None, {"credentials": "Invalid email or password"}

    if not user.is_active:
        return None, {"credentials": "This account has been deactivated"}

    session["user_id"] = user.id
    return serialize_user(user), None


def generate_admin_captcha():
    """Generate a word captcha image and store the answer in the session."""
    answer, image = generate_word_captcha_svg()
    session[ADMIN_CAPTCHA_SESSION_KEY] = answer
    return {"image": image}


def _verify_admin_captcha(answer: str):
    expected = session.get(ADMIN_CAPTCHA_SESSION_KEY)
    session.pop(ADMIN_CAPTCHA_SESSION_KEY, None)
    if not expected:
        return False
    return answer.strip().lower() == expected.lower()


def admin_login(data: dict):
    errors, validated = validate_admin_login_payload(data)
    if errors:
        return None, errors

    if not _verify_admin_captcha(validated["captcha_answer"]):
        return None, {"captcha_answer": "Incorrect captcha answer"}

    if validated["admin_id"] != ADMIN_ID:
        return None, {"admin_id": "Invalid admin ID"}

    user = User.query.filter_by(email=validated["email"]).first()
    if (
        not user
        or user.role != UserRole.ADMIN
        or not verify_password(user.password_hash, validated["password"])
    ):
        return None, {"credentials": "Invalid admin credentials"}

    if not user.is_active:
        return None, {"credentials": "This account has been deactivated"}

    session["user_id"] = user.id
    return serialize_user(user), None


def logout():
    session.clear()


def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None

    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        session.clear()
        return None

    return user
