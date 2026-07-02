from app.database.connection import db
from app.models.mixins import TimestampMixin


class ParentStudent(TimestampMixin, db.Model):
    """Association between a parent and their child (student)."""

    __tablename__ = "parent_students"

    parent_id = db.Column(
        db.Integer,
        db.ForeignKey("parents.id", ondelete="CASCADE"),
        primary_key=True,
    )
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id", ondelete="CASCADE"),
        primary_key=True,
    )
    relationship_type = db.Column(db.String(50), nullable=True)

    parent = db.relationship("Parent", back_populates="student_links")
    student = db.relationship("Student", back_populates="parent_links")

    def __repr__(self):
        return f"<ParentStudent parent={self.parent_id} student={self.student_id}>"
