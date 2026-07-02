import enum
from datetime import datetime, timezone

from app.database.connection import db
from app.models.mixins import TimestampMixin


class SubmissionStatus(enum.Enum):
    SUBMITTED = "submitted"
    GRADED = "graded"
    LATE = "late"
    RETURNED = "returned"


class Submission(TimestampMixin, db.Model):
    """A student's submission for an assignment."""

    __tablename__ = "submissions"
    __table_args__ = (
        db.UniqueConstraint(
            "assignment_id",
            "student_id",
            name="uq_assignment_student",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(
        db.Integer,
        db.ForeignKey("assignments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.String(500), nullable=True)
    file_name = db.Column(db.String(255), nullable=True)
    stored_name = db.Column(db.String(255), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)
    submitted_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    grade = db.Column(db.Numeric(8, 2), nullable=True)
    feedback = db.Column(db.Text, nullable=True)
    status = db.Column(
        db.Enum(SubmissionStatus),
        default=SubmissionStatus.SUBMITTED,
        nullable=False,
    )

    assignment = db.relationship("Assignment", back_populates="submissions")
    student = db.relationship("Student", back_populates="submissions")

    def __repr__(self):
        return f"<Submission assignment={self.assignment_id} student={self.student_id}>"
