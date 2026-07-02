import enum
from datetime import date

from app.database.connection import db
from app.models.mixins import TimestampMixin


class FeeStatus(enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    WAIVED = "waived"


class Fee(TimestampMixin, db.Model):
    """A fee charged to a student."""

    __tablename__ = "fees"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    paid_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(
        db.Enum(FeeStatus),
        default=FeeStatus.PENDING,
        nullable=False,
        index=True,
    )

    student = db.relationship("Student", back_populates="fees")

    def __repr__(self):
        return f"<Fee student={self.student_id} amount={self.amount}>"
