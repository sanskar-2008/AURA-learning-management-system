from datetime import datetime, timezone

from app.database.connection import db
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.grade import Grade
from app.models.student import Student
from app.utils.grade_utils import calculate_letter_grade, calculate_percentage
from app.utils.validators import validate_grade_payload


def _get_teacher_course(teacher, course_id):
    return Course.query.filter_by(id=course_id, teacher_id=teacher.id).first()


def _is_student_enrolled_in_course(student_id, course_id):
    return (
        Enrollment.query.filter_by(
            student_id=student_id,
            course_id=course_id,
            status=EnrollmentStatus.ACTIVE,
        ).first()
        is not None
    )


def _get_teacher_grade(teacher, course_id, grade_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None, None

    grade = Grade.query.filter_by(id=grade_id, course_id=course_id, evaluated_by=teacher.id).first()
    return course, grade


def serialize_grade(grade_record):
    student = grade_record.student
    user = student.user if student else None
    assignment = grade_record.assignment
    course = grade_record.course

    return {
        "id": grade_record.id,
        "student_id": grade_record.student_id,
        "student_number": student.student_number if student else None,
        "student_name": user.full_name if user else None,
        "course_id": grade_record.course_id,
        "course_code": course.code if course else None,
        "course_title": course.title if course else None,
        "assignment_id": grade_record.assignment_id,
        "evaluation_name": grade_record.evaluation_name,
        "assignment_title": assignment.title if assignment else None,
        "marks_obtained": float(grade_record.marks_obtained),
        "maximum_marks": float(grade_record.maximum_marks),
        "percentage": float(grade_record.percentage),
        "grade": grade_record.grade,
        "remarks": grade_record.remarks,
        "evaluated_by": grade_record.evaluated_by,
        "evaluated_at": grade_record.evaluated_at.isoformat() if grade_record.evaluated_at else None,
    }


def _grade_query_for_teacher(teacher, course_id=None, student_id=None):
    query = Grade.query.join(Course).filter(
        Course.teacher_id == teacher.id,
        Grade.evaluated_by == teacher.id,
    )

    if course_id:
        query = query.filter(Grade.course_id == course_id)
    if student_id:
        query = query.filter(Grade.student_id == student_id)

    return query.order_by(Grade.evaluated_at.desc())


def get_teacher_grades(teacher, course_id=None, student_id=None):
    grades = _grade_query_for_teacher(teacher, course_id=course_id, student_id=student_id).all()
    return [serialize_grade(item) for item in grades]


def get_teacher_course_grades(teacher, course_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None

    grades = _grade_query_for_teacher(teacher, course_id=course_id).all()
    return {
        "course": {
            "id": course.id,
            "code": course.code,
            "title": course.title,
        },
        "grades": [serialize_grade(item) for item in grades],
    }


def get_teacher_grade_detail(teacher, course_id, grade_id):
    _, grade = _get_teacher_grade(teacher, course_id, grade_id)
    if not grade:
        return None
    return serialize_grade(grade)


def _validate_grade_access(teacher, validated):
    course = _get_teacher_course(teacher, validated["course_id"])
    if not course:
        return {"course_id": "Course not found or access denied"}

    if not _is_student_enrolled_in_course(validated["student_id"], validated["course_id"]):
        return {"student_id": "Student is not enrolled in this course"}

    if validated["assignment_id"]:
        assignment = db.session.get(Assignment, validated["assignment_id"])
        if not assignment or assignment.course_id != validated["course_id"]:
            return {"assignment_id": "Assignment does not belong to this course"}

    return None


def create_teacher_grade(teacher, course_id, data):
    payload = {**data, "course_id": course_id}
    errors, validated = validate_grade_payload(payload)
    if errors:
        return None, errors

    access_errors = _validate_grade_access(teacher, validated)
    if access_errors:
        return None, access_errors

    percentage = calculate_percentage(validated["marks_obtained"], validated["maximum_marks"])
    letter_grade = calculate_letter_grade(percentage)

    grade_record = Grade(
        student_id=validated["student_id"],
        course_id=validated["course_id"],
        assignment_id=validated["assignment_id"],
        evaluation_name=validated["evaluation_name"],
        marks_obtained=validated["marks_obtained"],
        maximum_marks=validated["maximum_marks"],
        percentage=percentage,
        grade=letter_grade,
        remarks=validated["remarks"],
        evaluated_by=teacher.id,
        evaluated_at=datetime.now(timezone.utc),
    )
    db.session.add(grade_record)
    db.session.commit()

    return serialize_grade(grade_record), None


def update_teacher_grade(teacher, course_id, grade_id, data):
    _, grade_record = _get_teacher_grade(teacher, course_id, grade_id)
    if not grade_record:
        return None, {"grade": "Grade record not found or access denied"}

    payload = {
        **data,
        "course_id": course_id,
        "student_id": data.get("student_id", grade_record.student_id),
    }
    errors, validated = validate_grade_payload(payload)
    if errors:
        return None, errors

    access_errors = _validate_grade_access(teacher, validated)
    if access_errors:
        return None, access_errors

    percentage = calculate_percentage(validated["marks_obtained"], validated["maximum_marks"])
    letter_grade = calculate_letter_grade(percentage)

    grade_record.student_id = validated["student_id"]
    grade_record.assignment_id = validated["assignment_id"]
    grade_record.evaluation_name = validated["evaluation_name"]
    grade_record.marks_obtained = validated["marks_obtained"]
    grade_record.maximum_marks = validated["maximum_marks"]
    grade_record.percentage = percentage
    grade_record.grade = letter_grade
    grade_record.remarks = validated["remarks"]
    grade_record.evaluated_at = datetime.now(timezone.utc)

    db.session.commit()
    return serialize_grade(grade_record), None


def delete_teacher_grade(teacher, course_id, grade_id):
    _, grade_record = _get_teacher_grade(teacher, course_id, grade_id)
    if not grade_record:
        return False, {"grade": "Grade record not found or access denied"}

    db.session.delete(grade_record)
    db.session.commit()
    return True, None


def get_student_grades(student, course_id=None):
    query = (
        Grade.query.join(Enrollment, Enrollment.course_id == Grade.course_id)
        .filter(
            Grade.student_id == student.id,
            Enrollment.student_id == student.id,
            Enrollment.status == EnrollmentStatus.ACTIVE,
        )
    )

    if course_id:
        query = query.filter(Grade.course_id == course_id)

    grades = query.order_by(Grade.evaluated_at.desc()).all()
    return [serialize_grade(item) for item in grades]


def get_parent_child_grade_records(parent, student_id):
    from app.services.parent_service import _get_linked_student

    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    grades = (
        Grade.query.filter_by(student_id=student.id)
        .order_by(Grade.evaluated_at.desc())
        .all()
    )
    return [serialize_grade(item) for item in grades]


def upsert_quiz_grade_record(quiz, student_id, score, passed):
    """Create or update a grade entry when a student completes a quiz."""
    evaluation_name = f"Quiz: {quiz.title}"
    existing = Grade.query.filter_by(
        student_id=student_id,
        course_id=quiz.course_id,
        evaluation_name=evaluation_name,
    ).first()

    percentage = calculate_percentage(score, float(quiz.total_marks))
    letter_grade = calculate_letter_grade(percentage)
    remarks = f"Quiz score recorded automatically. Result: {'Pass' if passed else 'Fail'}."

    if existing:
        existing.marks_obtained = score
        existing.maximum_marks = float(quiz.total_marks)
        existing.percentage = percentage
        existing.grade = letter_grade
        existing.remarks = remarks
        existing.evaluated_by = quiz.teacher_id
        existing.evaluated_at = datetime.now(timezone.utc)
        return existing

    grade_record = Grade(
        student_id=student_id,
        course_id=quiz.course_id,
        assignment_id=None,
        evaluation_name=evaluation_name,
        marks_obtained=score,
        maximum_marks=float(quiz.total_marks),
        percentage=percentage,
        grade=letter_grade,
        remarks=remarks,
        evaluated_by=quiz.teacher_id,
        evaluated_at=datetime.now(timezone.utc),
    )
    db.session.add(grade_record)
    return grade_record
