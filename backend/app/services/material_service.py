from app.database.connection import db
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.learning_material import LearningMaterial, MaterialType
from app.utils.file_upload import delete_material_file, get_material_absolute_path, save_material_file
from app.utils.validators import validate_material_payload


def _get_teacher_course(teacher, course_id):
    return Course.query.filter_by(id=course_id, teacher_id=teacher.id).first()


def _is_student_enrolled(student, course_id):
    return (
        Enrollment.query.filter_by(
            student_id=student.id,
            course_id=course_id,
            status=EnrollmentStatus.ACTIVE,
        ).first()
        is not None
    )


def _get_teacher_material(teacher, course_id, material_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None, None

    material = LearningMaterial.query.filter_by(id=material_id, course_id=course_id).first()
    return course, material


def serialize_material(material, role="teacher"):
    has_file = bool(material.stored_name)
    file_url = f"/api/{role}/materials/{material.id}/file" if has_file else None
    return {
        "id": material.id,
        "course_id": material.course_id,
        "title": material.title,
        "description": material.description,
        "material_type": material.material_type.value,
        "file_name": material.file_name if has_file else None,
        "file_size": material.file_size if has_file else 0,
        "mime_type": material.mime_type,
        "file_url": file_url,
        "video_url": material.video_url,
        "has_file": has_file,
        "created_at": material.created_at.isoformat() if material.created_at else None,
        "updated_at": material.updated_at.isoformat() if material.updated_at else None,
    }


def get_teacher_materials_overview(teacher):
    courses = Course.query.filter_by(teacher_id=teacher.id).order_by(Course.title).all()
    overview = []
    for course in courses:
        materials = (
            LearningMaterial.query.filter_by(course_id=course.id)
            .order_by(LearningMaterial.created_at.desc())
            .all()
        )
        video_count = sum(1 for item in materials if item.material_type == MaterialType.VIDEO)
        pdf_count = sum(1 for item in materials if item.material_type == MaterialType.PDF)
        overview.append(
            {
                "id": course.id,
                "code": course.code,
                "title": course.title,
                "material_count": len(materials),
                "video_count": video_count,
                "pdf_count": pdf_count,
            }
        )
    return overview


def get_teacher_course_materials(teacher, course_id):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None

    materials = (
        LearningMaterial.query.filter_by(course_id=course_id)
        .order_by(LearningMaterial.created_at.desc())
        .all()
    )
    return {
        "course": {
            "id": course.id,
            "code": course.code,
            "title": course.title,
        },
        "materials": [serialize_material(material, role="teacher") for material in materials],
    }


def get_teacher_material_detail(teacher, course_id, material_id):
    _, material = _get_teacher_material(teacher, course_id, material_id)
    if not material:
        return None
    return serialize_material(material, role="teacher")


def create_teacher_material(teacher, course_id, data, file_storage):
    course = _get_teacher_course(teacher, course_id)
    if not course:
        return None, {"course": "Course not found or access denied"}

    payload = {
        **data,
        "has_file": bool(file_storage and file_storage.filename),
    }
    errors, validated = validate_material_payload(payload, require_file=True)
    if errors:
        return None, errors

    is_video_url = (
        validated["material_type"] == "video"
        and validated["video_url"]
        and not (file_storage and file_storage.filename)
    )

    file_data = None
    if file_storage and file_storage.filename:
        file_data, file_errors = save_material_file(
            course_id,
            validated["material_type"],
            file_storage,
        )
        if file_errors:
            return None, file_errors

    material = LearningMaterial(
        course_id=course_id,
        title=validated["title"],
        description=validated["description"],
        material_type=MaterialType(validated["material_type"]),
        file_name=file_data["file_name"] if file_data else "Video URL",
        stored_name=file_data["stored_name"] if file_data else "",
        file_size=file_data["file_size"] if file_data else 0,
        mime_type=file_data["mime_type"] if file_data else None,
        video_url=validated["video_url"] if is_video_url else None,
    )
    db.session.add(material)
    db.session.commit()

    return serialize_material(material, role="teacher"), None


def update_teacher_material(teacher, course_id, material_id, data, file_storage=None):
    course, material = _get_teacher_material(teacher, course_id, material_id)
    if not material:
        return None, {"material": "Material not found or access denied"}

    payload = {**data, "has_file": bool(file_storage and file_storage.filename)}
    errors, validated = validate_material_payload(payload, require_file=False)
    if errors:
        return None, errors

    material.title = validated["title"]
    material.description = validated["description"]

    if validated["material_type"] != material.material_type.value:
        if not (file_storage and file_storage.filename) and not validated["video_url"]:
            return None, {"material_type": "Upload a new file or provide a video URL when changing material type"}
        material.material_type = MaterialType(validated["material_type"])

    if validated["material_type"] == "video" and validated["video_url"]:
        if file_storage and file_storage.filename:
            file_data, file_errors = save_material_file(
                course_id,
                material.material_type.value,
                file_storage,
            )
            if file_errors:
                return None, file_errors

            if material.stored_name:
                delete_material_file(course_id, material.stored_name)
            material.file_name = file_data["file_name"]
            material.stored_name = file_data["stored_name"]
            material.file_size = file_data["file_size"]
            material.mime_type = file_data["mime_type"]
            material.video_url = None
        else:
            material.video_url = validated["video_url"]
    elif file_storage and file_storage.filename:
        file_data, file_errors = save_material_file(
            course_id,
            material.material_type.value,
            file_storage,
        )
        if file_errors:
            return None, file_errors

        if material.stored_name:
            delete_material_file(course_id, material.stored_name)
        material.file_name = file_data["file_name"]
        material.stored_name = file_data["stored_name"]
        material.file_size = file_data["file_size"]
        material.mime_type = file_data["mime_type"]
        if material.material_type == MaterialType.VIDEO:
            material.video_url = None

    db.session.commit()
    return serialize_material(material, role="teacher"), None


def delete_teacher_material(teacher, course_id, material_id):
    _, material = _get_teacher_material(teacher, course_id, material_id)
    if not material:
        return False, {"material": "Material not found or access denied"}

    if material.stored_name:
        delete_material_file(course_id, material.stored_name)
    db.session.delete(material)
    db.session.commit()
    return True, None


def get_student_course_materials(student, course_id):
    if not _is_student_enrolled(student, course_id):
        return None

    course = db.session.get(Course, course_id)
    if not course:
        return None

    materials = (
        LearningMaterial.query.filter_by(course_id=course_id)
        .order_by(LearningMaterial.created_at.desc())
        .all()
    )
    return {
        "course": {
            "id": course.id,
            "code": course.code,
            "title": course.title,
        },
        "materials": [serialize_material(material, role="student") for material in materials],
    }


def get_material_file_for_teacher(teacher, material_id):
    material = db.session.get(LearningMaterial, material_id)
    if not material:
        return None, None

    course = _get_teacher_course(teacher, material.course_id)
    if not course:
        return None, None

    file_path = get_material_absolute_path(material.course_id, material.stored_name)
    if not material.stored_name or not file_path.is_file():
        return None, None

    return file_path, material


def get_material_file_for_student(student, material_id):
    material = db.session.get(LearningMaterial, material_id)
    if not material:
        return None, None

    if not _is_student_enrolled(student, material.course_id):
        return None, None

    file_path = get_material_absolute_path(material.course_id, material.stored_name)
    if not material.stored_name or not file_path.is_file():
        return None, None

    return file_path, material
