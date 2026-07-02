from app.database.connection import db
from app.models.mixins import TimestampMixin


class Assignment(TimestampMixin, db.Model):
    """An assignment within a course."""

    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    max_points = db.Column(db.Numeric(8, 2), default=100, nullable=False)
    file_name = db.Column(db.String(255), nullable=True)
    stored_name = db.Column(db.String(255), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)

    course = db.relationship("Course", back_populates="assignments")
    submissions = db.relationship(
        "Submission",
        back_populates="assignment",
        cascade="all, delete-orphan",
    )
    grade_records = db.relationship(
        "Grade",
        back_populates="assignment",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Assignment {self.title}>"
