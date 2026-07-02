import re
from datetime import datetime, timezone

from app.models.user import UserRole

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
MIN_PASSWORD_LENGTH = 8
MAX_NAME_LENGTH = 100
SIGNUP_ROLES = {UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT}


def _strip(value):
    return value.strip() if isinstance(value, str) else ""


def validate_email(email, errors, field="email"):
    email = _strip(email).lower()
    if not email:
        errors[field] = "Email is required"
    elif not EMAIL_REGEX.match(email):
        errors[field] = "Enter a valid email address"
    return email


def validate_password(password, errors, field="password"):
    if not password:
        errors[field] = "Password is required"
    elif len(password) < MIN_PASSWORD_LENGTH:
        errors[field] = f"Password must be at least {MIN_PASSWORD_LENGTH} characters"
    return password


def validate_name(value, field_name, errors):
    value = _strip(value)
    if not value:
        errors[field_name] = f"{field_name.replace('_', ' ').title()} is required"
    elif len(value) > MAX_NAME_LENGTH:
        errors[field_name] = f"{field_name.replace('_', ' ').title()} is too long"
    return value


def validate_signup_payload(data):
    """Validate signup input and return errors plus normalized data."""
    errors = {}

    email = validate_email(data.get("email"), errors)
    password = validate_password(data.get("password"), errors)
    confirm_password = data.get("confirm_password")

    if not confirm_password:
        errors["confirm_password"] = "Please confirm your password"
    elif password and password != confirm_password:
        errors["confirm_password"] = "Passwords do not match"

    first_name = validate_name(data.get("first_name"), "first_name", errors)
    last_name = validate_name(data.get("last_name"), "last_name", errors)

    role_value = _strip(data.get("role")).lower()
    role = None
    if not role_value:
        errors["role"] = "Role is required"
    else:
        try:
            role = UserRole(role_value)
            if role not in SIGNUP_ROLES:
                errors["role"] = "Admin accounts cannot be created via signup"
                role = None
        except ValueError:
            errors["role"] = "Invalid role selected"

    student_number = None
    employee_id = None

    validated = {
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "role": role,
        "student_number": student_number,
        "employee_id": employee_id,
    }

    return errors, validated


def validate_login_payload(data):
    """Validate login input and return errors plus normalized data."""
    errors = {}

    email = validate_email(data.get("email"), errors)
    password = validate_password(data.get("password"), errors)

    validated = {
        "email": email,
        "password": password,
    }

    return errors, validated


def validate_admin_login_payload(data):
    """Validate admin login input and return errors plus normalized data."""
    errors = {}

    email = validate_email(data.get("email"), errors)
    password = validate_password(data.get("password"), errors)

    admin_id = _strip(data.get("admin_id"))
    if not admin_id:
        errors["admin_id"] = "Admin ID is required"

    captcha_answer = _strip(data.get("captcha_answer"))
    if not captcha_answer:
        errors["captcha_answer"] = "Captcha answer is required"

    validated = {
        "email": email,
        "password": password,
        "admin_id": admin_id,
        "captcha_answer": captcha_answer,
    }

    return errors, validated


def validate_profile_update_payload(data):
    """Validate student profile update input."""
    errors = {}

    email = validate_email(data.get("email"), errors)
    first_name = validate_name(data.get("first_name"), "first_name", errors)
    last_name = validate_name(data.get("last_name"), "last_name", errors)

    validated = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
    }

    return errors, validated


def validate_teacher_profile_update_payload(data):
    """Validate teacher profile update input."""
    errors = {}

    email = validate_email(data.get("email"), errors)
    first_name = validate_name(data.get("first_name"), "first_name", errors)
    last_name = validate_name(data.get("last_name"), "last_name", errors)

    validated = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
    }

    return errors, validated


def validate_link_child_payload(data):
    """Validate parent child link input."""
    errors = {}
    student_number = _strip(data.get("student_number"))

    if not student_number:
        errors["student_number"] = "Student roll number is required"

    return errors, {"student_number": student_number}


def validate_parent_profile_update_payload(data):
    """Validate parent profile update input."""
    errors = {}

    email = validate_email(data.get("email"), errors)
    first_name = validate_name(data.get("first_name"), "first_name", errors)
    last_name = validate_name(data.get("last_name"), "last_name", errors)

    validated = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
    }

    return errors, validated


def validate_password_change_payload(data):
    """Validate password change input."""
    errors = {}

    current_password = data.get("current_password")
    new_password = validate_password(data.get("new_password"), errors, field="new_password")
    confirm_password = data.get("confirm_password")

    if not current_password:
        errors["current_password"] = "Current password is required"
    if not confirm_password:
        errors["confirm_password"] = "Please confirm your new password"
    elif new_password and new_password != confirm_password:
        errors["confirm_password"] = "Passwords do not match"

    validated = {
        "current_password": current_password,
        "new_password": new_password,
    }

    return errors, validated


def validate_course_payload(data):
    """Validate teacher course create/update input."""
    errors = {}

    title = _strip(data.get("title"))
    code = _strip(data.get("code"))
    description = _strip(data.get("description"))

    if not title:
        errors["title"] = "Course title is required"
    elif len(title) > 200:
        errors["title"] = "Course title is too long"

    if not code:
        errors["code"] = "Course code is required"
    elif len(code) > 50:
        errors["code"] = "Course code is too long"

    if not description:
        errors["description"] = "Course description is required"

    validated = {
        "title": title,
        "code": code.upper(),
        "description": description,
    }

    return errors, validated


def _parse_datetime(value, errors, field):
    if not value:
        return None

    try:
        if isinstance(value, str):
            normalized = value.strip().replace(" ", "T")
            if len(normalized) == 16:
                normalized = f"{normalized}:00"
            parsed = datetime.fromisoformat(normalized.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
    except ValueError:
        errors[field] = "Enter a valid date and time"

    return None


def validate_assignment_payload(data):
    """Validate teacher assignment create/update input."""
    errors = {}

    title = _strip(data.get("title"))
    description = _strip(data.get("description"))
    course_id = data.get("course_id")
    due_date = data.get("due_date")
    max_points = data.get("max_points")

    if not title:
        errors["title"] = "Assignment title is required"
    elif len(title) > 200:
        errors["title"] = "Assignment title is too long"

    if not description:
        errors["description"] = "Description is required"

    parsed_course_id = None
    if course_id is None or course_id == "":
        errors["course_id"] = "Course is required"
    else:
        try:
            parsed_course_id = int(course_id)
        except (TypeError, ValueError):
            errors["course_id"] = "Invalid course selected"

    parsed_due_date = None
    if not due_date:
        errors["due_date"] = "Due date is required"
    else:
        parsed_due_date = _parse_datetime(due_date, errors, "due_date")

    parsed_max_points = None
    if max_points is None or max_points == "":
        errors["max_points"] = "Total marks is required"
    else:
        try:
            parsed_max_points = float(max_points)
            if parsed_max_points <= 0:
                errors["max_points"] = "Total marks must be greater than 0"
        except (TypeError, ValueError):
            errors["max_points"] = "Total marks must be a number"

    validated = {
        "title": title,
        "description": description,
        "course_id": parsed_course_id,
        "due_date": parsed_due_date,
        "max_points": parsed_max_points,
    }

    return errors, validated


def validate_material_payload(data, require_file=False):
    """Validate learning material metadata."""
    errors = {}

    title = _strip(data.get("title"))
    description = _strip(data.get("description"))
    material_type = _strip(data.get("material_type")).lower()
    video_url = _strip(data.get("video_url"))
    has_file = bool(data.get("has_file"))

    if not title:
        errors["title"] = "Title is required"
    elif len(title) > 200:
        errors["title"] = "Title is too long"

    if material_type not in {"video", "pdf"}:
        errors["material_type"] = "Material type must be video or pdf"

    if material_type == "video":
        if require_file and not has_file and not video_url:
            errors["file"] = "Upload a video file or provide a video URL"
        if video_url and not video_url.startswith(("http://", "https://")):
            errors["video_url"] = "Please enter a valid video URL starting with http:// or https://"
    elif require_file and not has_file:
        errors["file"] = "A file is required"

    validated = {
        "title": title,
        "description": description or None,
        "material_type": material_type,
        "video_url": video_url or None,
    }

    return errors, validated


def validate_grade_payload(data):
    """Validate grade entry input."""
    errors = {}

    evaluation_name = _strip(data.get("evaluation_name"))
    student_id = data.get("student_id")
    course_id = data.get("course_id")
    assignment_id = data.get("assignment_id")
    marks_obtained = data.get("marks_obtained")
    maximum_marks = data.get("maximum_marks")
    remarks = _strip(data.get("remarks"))

    if not evaluation_name:
        errors["evaluation_name"] = "Assignment or exam name is required"
    elif len(evaluation_name) > 200:
        errors["evaluation_name"] = "Name is too long"

    parsed_student_id = None
    if student_id in (None, ""):
        errors["student_id"] = "Student is required"
    else:
        try:
            parsed_student_id = int(student_id)
        except (TypeError, ValueError):
            errors["student_id"] = "Invalid student"

    parsed_course_id = None
    if course_id in (None, ""):
        errors["course_id"] = "Course is required"
    else:
        try:
            parsed_course_id = int(course_id)
        except (TypeError, ValueError):
            errors["course_id"] = "Invalid course"

    parsed_assignment_id = None
    if assignment_id not in (None, ""):
        try:
            parsed_assignment_id = int(assignment_id)
        except (TypeError, ValueError):
            errors["assignment_id"] = "Invalid assignment"

    parsed_marks = None
    parsed_maximum = None
    try:
        parsed_marks = float(marks_obtained)
        if parsed_marks < 0:
            errors["marks_obtained"] = "Marks obtained cannot be negative"
    except (TypeError, ValueError):
        errors["marks_obtained"] = "Marks obtained must be a number"

    try:
        parsed_maximum = float(maximum_marks)
        if parsed_maximum <= 0:
            errors["maximum_marks"] = "Maximum marks must be greater than zero"
    except (TypeError, ValueError):
        errors["maximum_marks"] = "Maximum marks must be a number"

    if parsed_marks is not None and parsed_maximum is not None and parsed_marks > parsed_maximum:
        errors["marks_obtained"] = "Marks obtained cannot exceed maximum marks"

    validated = {
        "evaluation_name": evaluation_name,
        "student_id": parsed_student_id,
        "course_id": parsed_course_id,
        "assignment_id": parsed_assignment_id,
        "marks_obtained": parsed_marks,
        "maximum_marks": parsed_maximum,
        "remarks": remarks or None,
    }

    return errors, validated


def validate_quiz_payload(data):
    """Validate quiz create/update input."""
    errors = {}

    title = _strip(data.get("title"))
    description = _strip(data.get("description"))
    course_id = data.get("course_id")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    duration = data.get("duration")
    allow_multiple_attempts = data.get("allow_multiple_attempts", False)
    show_results_after_submit = data.get("show_results_after_submit", True)
    passing_percentage = data.get("passing_percentage", 50)
    questions = data.get("questions") or []

    if not title:
        errors["title"] = "Quiz title is required"
    elif len(title) > 200:
        errors["title"] = "Quiz title is too long"

    parsed_course_id = None
    if course_id in (None, ""):
        errors["course_id"] = "Course is required"
    else:
        try:
            parsed_course_id = int(course_id)
        except (TypeError, ValueError):
            errors["course_id"] = "Invalid course"

    parsed_start = None
    if not start_time:
        errors["start_time"] = "Start date and time is required"
    else:
        parsed_start = _parse_datetime(start_time, errors, "start_time")

    parsed_end = None
    if not end_time:
        errors["end_time"] = "End date and time is required"
    else:
        parsed_end = _parse_datetime(end_time, errors, "end_time")

    if parsed_start and parsed_end and parsed_end <= parsed_start:
        errors["end_time"] = "End date must be after start date"

    parsed_duration = None
    if duration in (None, ""):
        errors["duration"] = "Time limit is required"
    else:
        try:
            parsed_duration = int(duration)
            if parsed_duration <= 0:
                errors["duration"] = "Time limit must be greater than zero"
        except (TypeError, ValueError):
            errors["duration"] = "Time limit must be a number of minutes"

    try:
        parsed_passing = float(passing_percentage)
        if parsed_passing < 0 or parsed_passing > 100:
            errors["passing_percentage"] = "Passing percentage must be between 0 and 100"
    except (TypeError, ValueError):
        errors["passing_percentage"] = "Passing percentage must be a number"

    validated_questions = []
    if not questions:
        errors["questions"] = "At least one question is required"
    else:
        for index, question in enumerate(questions):
            q_errors, q_validated = _validate_question_item(question, index)
            if q_errors:
                errors.update(q_errors)
            else:
                validated_questions.append(q_validated)

    total_marks = sum(q["marks"] for q in validated_questions) if validated_questions else 0

    validated = {
        "title": title,
        "description": description or None,
        "course_id": parsed_course_id,
        "start_time": parsed_start,
        "end_time": parsed_end,
        "duration": parsed_duration,
        "total_marks": total_marks,
        "allow_multiple_attempts": bool(allow_multiple_attempts),
        "show_results_after_submit": bool(show_results_after_submit),
        "passing_percentage": parsed_passing if "passing_percentage" not in errors else 50,
        "questions": validated_questions,
    }

    return errors, validated


def _validate_question_item(question, index):
    errors = {}
    prefix = f"questions.{index}"

    if not isinstance(question, dict):
        return {prefix: "Invalid question format"}, None

    question_text = _strip(question.get("question_text"))
    question_type = _strip(question.get("question_type", "mcq")).lower()
    option_a = _strip(question.get("option_a"))
    option_b = _strip(question.get("option_b"))
    option_c = _strip(question.get("option_c"))
    option_d = _strip(question.get("option_d"))
    correct_answer = _strip(question.get("correct_answer"))
    marks = question.get("marks", 1)

    if not question_text:
        errors[f"{prefix}.question_text"] = "Question text is required"

    if question_type not in {"mcq", "true_false", "short_answer"}:
        errors[f"{prefix}.question_type"] = "Question type must be mcq, true_false, or short_answer"

    if question_type == "mcq":
        if not all([option_a, option_b, option_c, option_d]):
            errors[f"{prefix}.options"] = "All four options are required for MCQ"
        if not correct_answer or correct_answer.lower() not in {"a", "b", "c", "d"}:
            errors[f"{prefix}.correct_answer"] = "Correct answer must be A, B, C, or D"
        else:
            correct_answer = correct_answer.lower()
    elif question_type == "true_false":
        if not correct_answer or correct_answer.lower() not in {"true", "false"}:
            errors[f"{prefix}.correct_answer"] = "Correct answer must be True or False"
        else:
            correct_answer = correct_answer.lower()
        option_a = "True"
        option_b = "False"
        option_c = None
        option_d = None
    elif question_type == "short_answer":
        if not correct_answer:
            errors[f"{prefix}.correct_answer"] = "Expected answer is required for short answer"

    try:
        parsed_marks = float(marks)
        if parsed_marks <= 0:
            errors[f"{prefix}.marks"] = "Marks must be greater than zero"
    except (TypeError, ValueError):
        errors[f"{prefix}.marks"] = "Marks must be a number"

    if errors:
        return errors, None

    return {}, {
        "question_text": question_text,
        "question_type": question_type,
        "option_a": option_a or None,
        "option_b": option_b or None,
        "option_c": option_c or None,
        "option_d": option_d or None,
        "correct_answer": correct_answer,
        "marks": parsed_marks,
    }


def validate_quiz_submit_payload(data):
    """Validate student quiz submission."""
    errors = {}
    answers = data.get("answers")
    time_taken_seconds = data.get("time_taken_seconds")

    if not isinstance(answers, list) or not answers:
        errors["answers"] = "Answers are required"
        return errors, None

    validated_answers = []
    for index, item in enumerate(answers):
        if not isinstance(item, dict):
            errors[f"answers.{index}"] = "Invalid answer format"
            continue
        question_id = item.get("question_id")
        answer_text = _strip(item.get("answer"))
        try:
            parsed_id = int(question_id)
        except (TypeError, ValueError):
            errors[f"answers.{index}.question_id"] = "Invalid question"
            continue
        if not answer_text:
            errors[f"answers.{index}.answer"] = "Answer is required"
            continue
        validated_answers.append({"question_id": parsed_id, "answer_text": answer_text})

    parsed_time = None
    if time_taken_seconds not in (None, ""):
        try:
            parsed_time = int(time_taken_seconds)
            if parsed_time < 0:
                errors["time_taken_seconds"] = "Time taken cannot be negative"
        except (TypeError, ValueError):
            errors["time_taken_seconds"] = "Time taken must be a number"

    return errors, {
        "answers": validated_answers,
        "time_taken_seconds": parsed_time,
    }
