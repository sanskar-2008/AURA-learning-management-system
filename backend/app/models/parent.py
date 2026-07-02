from app.database.connection import db
from app.models.mixins import TimestampMixin


class Parent(TimestampMixin, db.Model):
    """Parent/guardian profile linked to a user account."""

    __tablename__ = "parents"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    user = db.relationship("User", back_populates="parent_profile")
    student_links = db.relationship(
        "ParentStudent",
        back_populates="parent",
        cascade="all, delete-orphan",
    )
    children = db.relationship(
        "Student",
        secondary="parent_students",
        back_populates="parents",
        viewonly=True,
    )

    def __repr__(self):
        return f"<Parent user_id={self.user_id}>"
