import enum

from app.database.connection import db
from app.models.mixins import TimestampMixin


class MaterialType(str, enum.Enum):
    VIDEO = "video"
    PDF = "pdf"


class LearningMaterial(TimestampMixin, db.Model):
    """A learning material (video or PDF) attached to a course."""

    __tablename__ = "learning_materials"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    material_type = db.Column(db.Enum(MaterialType), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False, default=0)
    mime_type = db.Column(db.String(100), nullable=True)
    video_url = db.Column(db.String(500), nullable=True)

    course = db.relationship("Course", back_populates="materials")

    def __repr__(self):
        return f"<LearningMaterial {self.title}>"
