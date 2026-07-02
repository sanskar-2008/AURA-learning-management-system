from flask import g, request, send_file

from app.services.material_service import (
    create_teacher_material,
    delete_teacher_material,
    get_material_file_for_student,
    get_material_file_for_teacher,
    get_student_course_materials,
    get_teacher_course_materials,
    get_teacher_material_detail,
    get_teacher_materials_overview,
    update_teacher_material,
)
from app.utils.responses import error_response, success_response


def _get_teacher():
    teacher = g.current_user.teacher_profile
    if not teacher:
        return None, error_response("Teacher profile not found", status_code=404)
    return teacher, None


def _get_student():
    student = g.current_user.student_profile
    if not student:
        return None, error_response("Student profile not found", status_code=404)
    return student, None


def _form_data():
    return {
        "title": request.form.get("title"),
        "description": request.form.get("description"),
        "material_type": request.form.get("material_type"),
        "video_url": request.form.get("video_url"),
    }


def teacher_materials_overview():
    teacher, error = _get_teacher()
    if error:
        return error
    return success_response(data={"courses": get_teacher_materials_overview(teacher)})


def teacher_course_materials(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    result = get_teacher_course_materials(teacher, course_id)
    if not result:
        return error_response("Course not found", status_code=404)
    return success_response(data=result)


def teacher_material_detail(course_id, material_id):
    teacher, error = _get_teacher()
    if error:
        return error

    material = get_teacher_material_detail(teacher, course_id, material_id)
    if not material:
        return error_response("Material not found", status_code=404)
    return success_response(data={"material": material})


def _first_error_message(errors, default="Validation failed"):
    if not errors:
        return default
    return next(iter(errors.values()))


def teacher_create_material(course_id):
    teacher, error = _get_teacher()
    if error:
        return error

    material, errors = create_teacher_material(
        teacher,
        course_id,
        _form_data(),
        request.files.get("file"),
    )
    if errors:
        status = 404 if errors.get("course") else 400
        message = errors.get("course") or _first_error_message(errors)
        return error_response(message, status_code=status, errors=errors)

    return success_response(
        data={"material": material},
        message="Material uploaded successfully",
        status_code=201,
    )


def teacher_update_material(course_id, material_id):
    teacher, error = _get_teacher()
    if error:
        return error

    material, errors = update_teacher_material(
        teacher,
        course_id,
        material_id,
        _form_data(),
        request.files.get("file"),
    )
    if errors:
        status = 404 if errors.get("material") else 400
        message = errors.get("material") or _first_error_message(errors)
        return error_response(message, status_code=status, errors=errors)

    return success_response(
        data={"material": material},
        message="Material updated successfully",
    )


def teacher_delete_material(course_id, material_id):
    teacher, error = _get_teacher()
    if error:
        return error

    deleted, errors = delete_teacher_material(teacher, course_id, material_id)
    if not deleted:
        return error_response(
            errors.get("material", "Material not found"),
            status_code=404,
            errors=errors,
        )
    return success_response(message="Material deleted successfully")


def teacher_material_file(material_id):
    teacher, error = _get_teacher()
    if error:
        return error

    file_path, material = get_material_file_for_teacher(teacher, material_id)
    if not file_path:
        return error_response("File not found", status_code=404)

    mimetype = material.mime_type or "application/octet-stream"
    if material.material_type.value == "pdf":
        mimetype = "application/pdf"

    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=False,
        download_name=material.file_name,
    )


def student_course_materials(course_id):
    student, error = _get_student()
    if error:
        return error

    result = get_student_course_materials(student, course_id)
    if not result:
        return error_response("Course not found or you are not enrolled", status_code=404)
    return success_response(data=result)


def student_material_file(material_id):
    student, error = _get_student()
    if error:
        return error

    file_path, material = get_material_file_for_student(student, material_id)
    if not file_path:
        return error_response("File not found", status_code=404)

    is_pdf = material.material_type.value == "pdf"
    mimetype = "application/pdf" if is_pdf else (material.mime_type or "application/octet-stream")

    return send_file(
        file_path,
        mimetype=mimetype,
        as_attachment=is_pdf,
        download_name=material.file_name,
    )
