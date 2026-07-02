import enum

from app.database.connection import db
from app.models.mixins import TimestampMixin


class UserRole(enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    PARENT = "parent"
    ADMIN = "admin"


class User(TimestampMixin, db.Model):
    """Base account for all system users."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    student_profile = db.relationship(
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    teacher_profile = db.relationship(
        "Teacher",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    parent_profile = db.relationship(
        "Parent",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __repr__(self):
        return f"<User {self.email}>"
