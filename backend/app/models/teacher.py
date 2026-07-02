from app.database.connection import db
from app.models.mixins import TimestampMixin


class Teacher(TimestampMixin, db.Model):
    """Teacher profile linked to a user account."""

    __tablename__ = "teachers"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    department = db.Column(db.String(100), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)

    user = db.relationship("User", back_populates="teacher_profile")
    courses = db.relationship(
        "Course",
        back_populates="teacher",
        cascade="all, delete-orphan",
    )
    grade_records = db.relationship(
        "Grade",
        back_populates="evaluator",
        cascade="all, delete-orphan",
    )
    quizzes = db.relationship(
        "Quiz",
        back_populates="teacher",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Teacher {self.employee_id}>"
