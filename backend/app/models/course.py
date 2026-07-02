from app.database.connection import db
from app.models.mixins import TimestampMixin


class Course(TimestampMixin, db.Model):
    """A course taught by a teacher."""

    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    credits = db.Column(db.Integer, default=0, nullable=False)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    teacher = db.relationship("Teacher", back_populates="courses")
    enrollments = db.relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    assignments = db.relationship(
        "Assignment",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    attendance_records = db.relationship(
        "Attendance",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    materials = db.relationship(
        "LearningMaterial",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    grade_records = db.relationship(
        "Grade",
        back_populates="course",
        cascade="all, delete-orphan",
    )
    quizzes = db.relationship(
        "Quiz",
        back_populates="course",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Course {self.code}>"
