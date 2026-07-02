import uuid
from pathlib import Path

from flask import current_app
from werkzeug.utils import secure_filename


def _allowed_extension(filename, material_type):
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if material_type == "video":
        return extension in current_app.config["ALLOWED_VIDEO_EXTENSIONS"]
    if material_type == "pdf":
        return extension in current_app.config["ALLOWED_PDF_EXTENSIONS"]
    return False


def save_material_file(course_id, material_type, file_storage):
    """Validate and save an uploaded material file. Returns metadata dict or errors."""
    if not file_storage or not file_storage.filename:
        return None, {"file": "A file is required"}

    original_name = secure_filename(file_storage.filename)
    if not original_name:
        return None, {"file": "Invalid file name"}

    if not _allowed_extension(original_name, material_type):
        allowed = (
            current_app.config["ALLOWED_VIDEO_EXTENSIONS"]
            if material_type == "video"
            else current_app.config["ALLOWED_PDF_EXTENSIONS"]
        )
        return None, {"file": f"Allowed file types: {', '.join(sorted(allowed))}"}

    file_storage.seek(0, 2)
    file_size = file_storage.tell()
    file_storage.seek(0)

    if material_type == "pdf":
        header = file_storage.read(5)
        file_storage.seek(0)
        if header != b"%PDF-":
            return None, {"file": "The uploaded file is not a valid PDF"}

    max_size = current_app.config["MAX_MATERIAL_FILE_SIZE"]
    if file_size > max_size:
        return None, {"file": f"File is too large. Maximum size is {max_size // (1024 * 1024)} MB"}

    upload_root = Path(current_app.config["UPLOAD_FOLDER"])
    course_dir = upload_root / str(course_id)
    course_dir.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4().hex}_{original_name}"
    file_path = course_dir / stored_name
    file_storage.save(file_path)

    return {
        "file_name": original_name,
        "stored_name": stored_name,
        "file_size": file_size,
        "mime_type": file_storage.mimetype or "application/octet-stream",
        "absolute_path": file_path,
    }, None


def delete_material_file(course_id, stored_name):
    """Remove a stored material file from disk if it exists."""
    if not stored_name:
        return

    file_path = Path(current_app.config["UPLOAD_FOLDER"]) / str(course_id) / stored_name
    if file_path.is_file():
        file_path.unlink()


def get_material_absolute_path(course_id, stored_name):
    return Path(current_app.config["UPLOAD_FOLDER"]) / str(course_id) / stored_name


def _allowed_assignment_extension(filename):
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return extension in current_app.config["ALLOWED_ASSIGNMENT_EXTENSIONS"]


def _validate_assignment_file(file_storage):
    """Validate an assignment or submission upload. Returns metadata dict or errors."""
    if not file_storage or not file_storage.filename:
        return None, {"file": "A file is required"}

    original_name = secure_filename(file_storage.filename)
    if not original_name:
        return None, {"file": "Invalid file name"}

    if not _allowed_assignment_extension(original_name):
        allowed = current_app.config["ALLOWED_ASSIGNMENT_EXTENSIONS"]
        return None, {"file": f"Allowed file types: {', '.join(sorted(allowed))}"}

    file_storage.seek(0, 2)
    file_size = file_storage.tell()
    file_storage.seek(0)

    extension = original_name.rsplit(".", 1)[-1].lower()
    if extension == "pdf":
        header = file_storage.read(5)
        file_storage.seek(0)
        if header != b"%PDF-":
            return None, {"file": "The uploaded file is not a valid PDF"}

    max_size = current_app.config["MAX_ASSIGNMENT_FILE_SIZE"]
    if file_size > max_size:
        return None, {"file": f"File is too large. Maximum size is {max_size // (1024 * 1024)} MB"}

    return {
        "file_name": original_name,
        "file_size": file_size,
        "mime_type": file_storage.mimetype or "application/octet-stream",
    }, None


def save_assignment_file(assignment_id, file_storage):
    """Validate and save a teacher assignment attachment."""
    metadata, errors = _validate_assignment_file(file_storage)
    if errors:
        return None, errors

    upload_root = Path(current_app.config["UPLOAD_ASSIGNMENTS_FOLDER"])
    assignment_dir = upload_root / str(assignment_id)
    assignment_dir.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4().hex}_{metadata['file_name']}"
    file_path = assignment_dir / stored_name
    file_storage.save(file_path)

    metadata["stored_name"] = stored_name
    metadata["absolute_path"] = file_path
    return metadata, None


def save_submission_file(assignment_id, student_id, file_storage):
    """Validate and save a student submission file."""
    metadata, errors = _validate_assignment_file(file_storage)
    if errors:
        return None, errors

    upload_root = Path(current_app.config["UPLOAD_SUBMISSIONS_FOLDER"])
    submission_dir = upload_root / str(assignment_id) / str(student_id)
    submission_dir.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4().hex}_{metadata['file_name']}"
    file_path = submission_dir / stored_name
    file_storage.save(file_path)

    metadata["stored_name"] = stored_name
    metadata["absolute_path"] = file_path
    return metadata, None


def delete_assignment_file(assignment_id, stored_name):
    if not stored_name:
        return

    file_path = Path(current_app.config["UPLOAD_ASSIGNMENTS_FOLDER"]) / str(assignment_id) / stored_name
    if file_path.is_file():
        file_path.unlink()


def delete_submission_file(assignment_id, student_id, stored_name):
    if not stored_name:
        return

    file_path = (
        Path(current_app.config["UPLOAD_SUBMISSIONS_FOLDER"])
        / str(assignment_id)
        / str(student_id)
        / stored_name
    )
    if file_path.is_file():
        file_path.unlink()


def get_assignment_absolute_path(assignment_id, stored_name):
    return Path(current_app.config["UPLOAD_ASSIGNMENTS_FOLDER"]) / str(assignment_id) / stored_name


def get_submission_absolute_path(assignment_id, student_id, stored_name):
    return (
        Path(current_app.config["UPLOAD_SUBMISSIONS_FOLDER"])
        / str(assignment_id)
        / str(student_id)
        / stored_name
    )
