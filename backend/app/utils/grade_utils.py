def calculate_percentage(marks_obtained, maximum_marks):
    if maximum_marks <= 0:
        return 0.0
    return round((float(marks_obtained) / float(maximum_marks)) * 100, 2)


def calculate_letter_grade(percentage):
    if percentage >= 90:
        return "A+"
    if percentage >= 80:
        return "A"
    if percentage >= 70:
        return "B"
    if percentage >= 60:
        return "C"
    if percentage >= 50:
        return "D"
    return "F"
