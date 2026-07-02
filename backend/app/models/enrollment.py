import enum
from datetime import datetime, timezone

from app.database.connection import db


class EnrollmentStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"


class Enrollment(db.Model):
    """Links a student to a course they are enrolled in."""

    __tablename__ = "enrollments"
    __table_args__ = (
        db.UniqueConstraint("student_id", "course_id", name="uq_student_course"),
    )

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = db.Column(
        db.Enum(EnrollmentStatus),
        default=EnrollmentStatus.ACTIVE,
        nullable=False,
    )
    enrolled_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    final_grade = db.Column(db.String(10), nullable=True)

    student = db.relationship("Student", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")

    def __repr__(self):
        return f"<Enrollment student={self.student_id} course={self.course_id}>"
