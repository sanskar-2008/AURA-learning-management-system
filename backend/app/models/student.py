from datetime import date

from app.database.connection import db
from app.models.mixins import TimestampMixin


class Student(TimestampMixin, db.Model):
    """Student profile linked to a user account."""

    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    student_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    grade_level = db.Column(db.String(50), nullable=True)

    user = db.relationship("User", back_populates="student_profile")
    enrollments = db.relationship(
        "Enrollment",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    submissions = db.relationship(
        "Submission",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    attendance_records = db.relationship(
        "Attendance",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    fees = db.relationship(
        "Fee",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    parent_links = db.relationship(
        "ParentStudent",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    parents = db.relationship(
        "Parent",
        secondary="parent_students",
        back_populates="children",
        viewonly=True,
    )
    grade_records = db.relationship(
        "Grade",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    quiz_attempts = db.relationship(
        "QuizAttempt",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Student {self.student_number}>"
