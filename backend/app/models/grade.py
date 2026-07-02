from app.database.connection import db
from app.models.mixins import TimestampMixin


class Grade(TimestampMixin, db.Model):
    """A teacher-evaluated mark for a student in a course."""

    __tablename__ = "grades"

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
    assignment_id = db.Column(
        db.Integer,
        db.ForeignKey("assignments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    evaluation_name = db.Column(db.String(200), nullable=False)
    marks_obtained = db.Column(db.Numeric(8, 2), nullable=False)
    maximum_marks = db.Column(db.Numeric(8, 2), nullable=False)
    percentage = db.Column(db.Numeric(5, 2), nullable=False)
    grade = db.Column(db.String(5), nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    evaluated_by = db.Column(
        db.Integer,
        db.ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    evaluated_at = db.Column(db.DateTime, nullable=False)

    student = db.relationship("Student", back_populates="grade_records")
    course = db.relationship("Course", back_populates="grade_records")
    assignment = db.relationship("Assignment", back_populates="grade_records")
    evaluator = db.relationship("Teacher", back_populates="grade_records")

    def __repr__(self):
        return f"<Grade {self.evaluation_name} student={self.student_id}>"
