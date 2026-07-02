import enum
from datetime import date

from app.database.connection import db
from app.models.mixins import TimestampMixin


class AttendanceStatus(enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class Attendance(TimestampMixin, db.Model):
    """Daily attendance record for a student in a course."""

    __tablename__ = "attendance"
    __table_args__ = (
        db.UniqueConstraint(
            "course_id",
            "student_id",
            "date",
            name="uq_course_student_date",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = db.Column(db.Date, nullable=False, index=True)
    status = db.Column(
        db.Enum(AttendanceStatus),
        default=AttendanceStatus.PRESENT,
        nullable=False,
    )
    notes = db.Column(db.String(255), nullable=True)

    course = db.relationship("Course", back_populates="attendance_records")
    student = db.relationship("Student", back_populates="attendance_records")

    def __repr__(self):
        return f"<Attendance course={self.course_id} student={self.student_id} date={self.date}>"
