import re

from app.database.connection import db
from app.models.student import Student
from app.models.teacher import Teacher

STUDENT_ID_PREFIX = "ST"
TEACHER_ID_PREFIX = "TE"


def format_serial_id(prefix: str, number: int) -> str:
    """Format ST01..ST99, ST100.. or TE01..TE99, TE100.."""
    if number < 100:
        return f"{prefix}{number:02d}"
    return f"{prefix}{number}"


def _max_serial_number(prefix: str, values: list[str]) -> int:
    pattern = re.compile(rf"^{re.escape(prefix)}(\d+)$", re.IGNORECASE)
    max_num = 0
    for value in values:
        if not value:
            continue
        match = pattern.match(value.strip().upper())
        if match:
            max_num = max(max_num, int(match.group(1)))
    return max_num


def next_student_number() -> str:
    numbers = [row[0] for row in db.session.query(Student.student_number).all()]
    return format_serial_id(STUDENT_ID_PREFIX, _max_serial_number(STUDENT_ID_PREFIX, numbers) + 1)


def next_teacher_employee_id() -> str:
    employee_ids = [row[0] for row in db.session.query(Teacher.employee_id).all()]
    return format_serial_id(TEACHER_ID_PREFIX, _max_serial_number(TEACHER_ID_PREFIX, employee_ids) + 1)
