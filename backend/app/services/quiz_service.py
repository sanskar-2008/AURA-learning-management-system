from datetime import datetime, timezone

from app.database.connection import db
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.quiz import Question, QuestionType, Quiz, QuizAnswer, QuizAttempt
from app.utils.grade_utils import calculate_percentage
from app.utils.validators import validate_quiz_payload, validate_quiz_submit_payload


def _get_teacher_course(teacher, course_id):
    return Course.query.filter_by(id=course_id, teacher_id=teacher.id).first()


def _get_teacher_quiz(teacher, quiz_id):
    return Quiz.query.filter_by(id=quiz_id, teacher_id=teacher.id).first()


def _is_student_enrolled(student, course_id):
    return (
        Enrollment.query.filter_by(
            student_id=student.id,
            course_id=course_id,
            status=EnrollmentStatus.ACTIVE,
        ).first()
        is not None
    )


def _quiz_status(quiz, now=None):
    now = now or datetime.now(timezone.utc)
    start = quiz.start_time
    end = quiz.end_time
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    if now < start:
        return "upcoming"
    if now > end:
        return "closed"
    return "active"


def _serialize_question(question, include_answer=False):
    data = {
        "id": question.id,
        "question_text": question.question_text,
        "question_type": question.question_type.value,
        "option_a": question.option_a,
        "option_b": question.option_b,
        "option_c": question.option_c,
        "option_d": question.option_d,
        "marks": float(question.marks),
    }
    if include_answer:
        data["correct_answer"] = question.correct_answer
    return data


def _serialize_quiz(quiz, include_questions=False, include_answers=False, extra=None):
    status = _quiz_status(quiz)
    data = {
        "id": quiz.id,
        "course_id": quiz.course_id,
        "course_code": quiz.course.code if quiz.course else None,
        "course_title": quiz.course.title if quiz.course else None,
        "teacher_id": quiz.teacher_id,
        "title": quiz.title,
        "description": quiz.description,
        "start_time": quiz.start_time.isoformat() if quiz.start_time else None,
        "end_time": quiz.end_time.isoformat() if quiz.end_time else None,
        "duration": quiz.duration,
        "total_marks": float(quiz.total_marks),
        "question_count": len(quiz.questions),
        "allow_multiple_attempts": quiz.allow_multiple_attempts,
        "show_results_after_submit": quiz.show_results_after_submit,
        "passing_percentage": float(quiz.passing_percentage),
        "status": status,
        "created_at": quiz.created_at.isoformat() if quiz.created_at else None,
    }
    if include_questions:
        data["questions"] = [
            _serialize_question(question, include_answer=include_answers)
            for question in quiz.questions
        ]
    if extra:
        data.update(extra)
    return data


def _serialize_attempt(attempt, include_answers=False):
    student = attempt.student
    user = student.user if student else None
    data = {
        "id": attempt.id,
        "quiz_id": attempt.quiz_id,
        "quiz_title": attempt.quiz.title if attempt.quiz else None,
        "course_title": attempt.quiz.course.title if attempt.quiz and attempt.quiz.course else None,
        "student_id": attempt.student_id,
        "student_name": user.full_name if user else None,
        "student_number": student.student_number if student else None,
        "score": float(attempt.score),
        "percentage": float(attempt.percentage),
        "passed": attempt.passed,
        "time_taken_seconds": attempt.time_taken_seconds,
        "submitted_at": attempt.submitted_at.isoformat() if attempt.submitted_at else None,
        "total_marks": float(attempt.quiz.total_marks) if attempt.quiz else None,
    }
    if include_answers:
        data["answers"] = [
            {
                "question_id": answer.question_id,
                "question_text": answer.question.question_text if answer.question else None,
                "answer_text": answer.answer_text,
                "is_correct": answer.is_correct,
                "marks_awarded": float(answer.marks_awarded),
                "correct_answer": answer.question.correct_answer if answer.question else None,
            }
            for answer in attempt.answers
        ]
    return data


def _evaluate_answer(question, answer_text):
    normalized = (answer_text or "").strip().lower()
    correct = (question.correct_answer or "").strip().lower()

    if question.question_type == QuestionType.MCQ:
        is_correct = normalized == correct
    elif question.question_type == QuestionType.TRUE_FALSE:
        is_correct = normalized == correct
    else:
        is_correct = normalized == correct

    marks_awarded = float(question.marks) if is_correct else 0.0
    return is_correct, marks_awarded


def _create_questions(quiz, questions_data):
    for item in questions_data:
        question = Question(
            quiz_id=quiz.id,
            question_text=item["question_text"],
            question_type=QuestionType(item["question_type"]),
            option_a=item["option_a"],
            option_b=item["option_b"],
            option_c=item["option_c"],
            option_d=item["option_d"],
            correct_answer=item["correct_answer"],
            marks=item["marks"],
        )
        db.session.add(question)


def get_teacher_quizzes(teacher, course_id=None):
    query = Quiz.query.filter_by(teacher_id=teacher.id).order_by(Quiz.start_time.desc())
    if course_id:
        query = query.filter_by(course_id=course_id)
    return [_serialize_quiz(quiz) for quiz in query.all()]


def get_teacher_quiz_detail(teacher, quiz_id):
    quiz = _get_teacher_quiz(teacher, quiz_id)
    if not quiz:
        return None
    return _serialize_quiz(quiz, include_questions=True, include_answers=True)


def create_teacher_quiz(teacher, data):
    errors, validated = validate_quiz_payload(data)
    if errors:
        return None, errors

    course = _get_teacher_course(teacher, validated["course_id"])
    if not course:
        return None, {"course_id": "Course not found or access denied"}

    quiz = Quiz(
        course_id=validated["course_id"],
        teacher_id=teacher.id,
        title=validated["title"],
        description=validated["description"],
        start_time=validated["start_time"],
        end_time=validated["end_time"],
        duration=validated["duration"],
        total_marks=validated["total_marks"],
        allow_multiple_attempts=validated["allow_multiple_attempts"],
        show_results_after_submit=validated["show_results_after_submit"],
        passing_percentage=validated["passing_percentage"],
    )
    db.session.add(quiz)
    db.session.flush()
    _create_questions(quiz, validated["questions"])
    db.session.commit()
    db.session.refresh(quiz)
    return _serialize_quiz(quiz, include_questions=True, include_answers=True), None


def update_teacher_quiz(teacher, quiz_id, data):
    quiz = _get_teacher_quiz(teacher, quiz_id)
    if not quiz:
        return None, {"quiz": "Quiz not found or access denied"}

    errors, validated = validate_quiz_payload(data)
    if errors:
        return None, errors

    course = _get_teacher_course(teacher, validated["course_id"])
    if not course:
        return None, {"course_id": "Course not found or access denied"}

    quiz.course_id = validated["course_id"]
    quiz.title = validated["title"]
    quiz.description = validated["description"]
    quiz.start_time = validated["start_time"]
    quiz.end_time = validated["end_time"]
    quiz.duration = validated["duration"]
    quiz.total_marks = validated["total_marks"]
    quiz.allow_multiple_attempts = validated["allow_multiple_attempts"]
    quiz.show_results_after_submit = validated["show_results_after_submit"]
    quiz.passing_percentage = validated["passing_percentage"]

    for question in list(quiz.questions):
        db.session.delete(question)
    db.session.flush()
    _create_questions(quiz, validated["questions"])
    db.session.commit()
    db.session.refresh(quiz)
    return _serialize_quiz(quiz, include_questions=True, include_answers=True), None


def delete_teacher_quiz(teacher, quiz_id):
    quiz = _get_teacher_quiz(teacher, quiz_id)
    if not quiz:
        return False, {"quiz": "Quiz not found or access denied"}
    db.session.delete(quiz)
    db.session.commit()
    return True, None


def get_teacher_quiz_results(teacher, quiz_id):
    quiz = _get_teacher_quiz(teacher, quiz_id)
    if not quiz:
        return None

    attempts = (
        QuizAttempt.query.filter_by(quiz_id=quiz_id)
        .order_by(QuizAttempt.submitted_at.desc())
        .all()
    )
    return {
        "quiz": _serialize_quiz(quiz),
        "attempts": [_serialize_attempt(attempt) for attempt in attempts],
        "summary": {
            "total_attempts": len(attempts),
            "average_score": round(
                sum(float(a.score) for a in attempts) / len(attempts), 2
            )
            if attempts
            else 0,
            "pass_count": sum(1 for a in attempts if a.passed),
        },
    }


def get_student_quizzes(student):
    enrolled_course_ids = [
        enrollment.course_id
        for enrollment in Enrollment.query.filter_by(
            student_id=student.id,
            status=EnrollmentStatus.ACTIVE,
        ).all()
    ]
    if not enrolled_course_ids:
        return []

    quizzes = (
        Quiz.query.filter(Quiz.course_id.in_(enrolled_course_ids))
        .order_by(Quiz.start_time.desc())
        .all()
    )

    attempts = {
        attempt.quiz_id: attempt
        for attempt in QuizAttempt.query.filter_by(student_id=student.id)
        .order_by(QuizAttempt.submitted_at.desc())
        .all()
    }
    # Keep only latest attempt per quiz
    latest_attempts = {}
    for attempt in attempts.values():
        if attempt.quiz_id not in latest_attempts:
            latest_attempts[attempt.quiz_id] = attempt

    result = []
    for quiz in quizzes:
        attempt = latest_attempts.get(quiz.id)
        extra = {
            "has_attempted": attempt is not None,
            "attempt_id": attempt.id if attempt else None,
            "can_attempt": _can_student_attempt(quiz, student, attempt),
        }
        result.append(_serialize_quiz(quiz, extra=extra))
    return result


def _can_student_attempt(quiz, student, existing_attempt):
    if not _is_student_enrolled(student, quiz.course_id):
        return False
    if _quiz_status(quiz) != "active":
        return False
    if existing_attempt and not quiz.allow_multiple_attempts:
        return False
    return True


def get_student_quiz_for_attempt(student, quiz_id):
    quiz = db.session.get(Quiz, quiz_id)
    if not quiz or not _is_student_enrolled(student, quiz.course_id):
        return None, {"quiz": "Quiz not found or you are not enrolled"}

    existing = QuizAttempt.query.filter_by(quiz_id=quiz_id, student_id=student.id).first()
    if existing and not quiz.allow_multiple_attempts:
        return None, {"quiz": "You have already attempted this quiz"}

    if _quiz_status(quiz) != "active":
        return None, {"quiz": "This quiz is not currently available"}

    return _serialize_quiz(quiz, include_questions=True, include_answers=False), None


def submit_student_quiz(student, quiz_id, data):
    quiz = db.session.get(Quiz, quiz_id)
    if not quiz or not _is_student_enrolled(student, quiz.course_id):
        return None, {"quiz": "Quiz not found or you are not enrolled"}

    if _quiz_status(quiz) != "active":
        return None, {"quiz": "This quiz has closed"}

    existing = QuizAttempt.query.filter_by(quiz_id=quiz_id, student_id=student.id).first()
    if existing and not quiz.allow_multiple_attempts:
        return None, {"quiz": "You have already attempted this quiz"}

    errors, validated = validate_quiz_submit_payload(data)
    if errors:
        return None, errors

    if validated["time_taken_seconds"] and validated["time_taken_seconds"] > quiz.duration * 60:
        return None, {"time_taken_seconds": "Time limit exceeded"}

    questions = {question.id: question for question in quiz.questions}
    if len(validated["answers"]) != len(questions):
        return None, {"answers": "Please answer all questions"}

    total_score = 0.0
    attempt = QuizAttempt(
        quiz_id=quiz.id,
        student_id=student.id,
        score=0,
        percentage=0,
        passed=False,
        time_taken_seconds=validated["time_taken_seconds"],
        submitted_at=datetime.now(timezone.utc),
    )
    db.session.add(attempt)
    db.session.flush()

    for item in validated["answers"]:
        question = questions.get(item["question_id"])
        if not question:
            return None, {"answers": "Invalid question in submission"}

        is_correct, marks_awarded = _evaluate_answer(question, item["answer_text"])
        total_score += marks_awarded
        db.session.add(
            QuizAnswer(
                attempt_id=attempt.id,
                question_id=question.id,
                answer_text=item["answer_text"],
                is_correct=is_correct,
                marks_awarded=marks_awarded,
            )
        )

    percentage = calculate_percentage(total_score, float(quiz.total_marks))
    attempt.score = total_score
    attempt.percentage = percentage
    attempt.passed = percentage >= float(quiz.passing_percentage)

    from app.services.grade_service import upsert_quiz_grade_record

    upsert_quiz_grade_record(quiz, student.id, total_score, attempt.passed)
    db.session.commit()

    include_details = quiz.show_results_after_submit
    return _serialize_attempt(attempt, include_answers=include_details), None


def get_student_quiz_result(student, quiz_id):
    quiz = db.session.get(Quiz, quiz_id)
    if not quiz or not _is_student_enrolled(student, quiz.course_id):
        return None

    attempt = (
        QuizAttempt.query.filter_by(quiz_id=quiz_id, student_id=student.id)
        .order_by(QuizAttempt.submitted_at.desc())
        .first()
    )
    if not attempt:
        return None

    include_details = quiz.show_results_after_submit
    return {
        "quiz": _serialize_quiz(quiz),
        "attempt": _serialize_attempt(attempt, include_answers=include_details),
    }


def get_parent_child_quiz_results(parent, student_id):
    from app.services.parent_service import _get_linked_student

    student = _get_linked_student(parent, student_id)
    if not student:
        return None

    attempts = (
        QuizAttempt.query.filter_by(student_id=student.id)
        .order_by(QuizAttempt.submitted_at.desc())
        .all()
    )
    return [_serialize_attempt(attempt) for attempt in attempts]
