import enum

from app.database.connection import db
from app.models.mixins import TimestampMixin


class QuestionType(str, enum.Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"


class Quiz(TimestampMixin, db.Model):
    """An online quiz or test for a course."""

    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(
        db.Integer,
        db.ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    teacher_id = db.Column(
        db.Integer,
        db.ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    total_marks = db.Column(db.Numeric(8, 2), nullable=False, default=0)
    allow_multiple_attempts = db.Column(db.Boolean, default=False, nullable=False)
    show_results_after_submit = db.Column(db.Boolean, default=True, nullable=False)
    passing_percentage = db.Column(db.Numeric(5, 2), default=50, nullable=False)

    course = db.relationship("Course", back_populates="quizzes")
    teacher = db.relationship("Teacher", back_populates="quizzes")
    questions = db.relationship(
        "Question",
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="Question.id",
    )
    attempts = db.relationship(
        "QuizAttempt",
        back_populates="quiz",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Quiz {self.title}>"


class Question(db.Model):
    """A question within a quiz."""

    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(
        db.Integer,
        db.ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.Enum(QuestionType), nullable=False, default=QuestionType.MCQ)
    option_a = db.Column(db.String(500), nullable=True)
    option_b = db.Column(db.String(500), nullable=True)
    option_c = db.Column(db.String(500), nullable=True)
    option_d = db.Column(db.String(500), nullable=True)
    correct_answer = db.Column(db.String(500), nullable=False)
    marks = db.Column(db.Numeric(8, 2), nullable=False, default=1)

    quiz = db.relationship("Quiz", back_populates="questions")
    answers = db.relationship(
        "QuizAnswer",
        back_populates="question",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<Question {self.id} quiz={self.quiz_id}>"


class QuizAttempt(db.Model):
    """A student's quiz submission."""

    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(
        db.Integer,
        db.ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score = db.Column(db.Numeric(8, 2), nullable=False, default=0)
    percentage = db.Column(db.Numeric(5, 2), nullable=False, default=0)
    passed = db.Column(db.Boolean, default=False, nullable=False)
    time_taken_seconds = db.Column(db.Integer, nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=False)

    quiz = db.relationship("Quiz", back_populates="attempts")
    student = db.relationship("Student", back_populates="quiz_attempts")
    answers = db.relationship(
        "QuizAnswer",
        back_populates="attempt",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<QuizAttempt quiz={self.quiz_id} student={self.student_id}>"


class QuizAnswer(db.Model):
    """An answer given in a quiz attempt."""

    __tablename__ = "quiz_answers"

    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(
        db.Integer,
        db.ForeignKey("quiz_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id = db.Column(
        db.Integer,
        db.ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    answer_text = db.Column(db.String(500), nullable=True)
    is_correct = db.Column(db.Boolean, nullable=True)
    marks_awarded = db.Column(db.Numeric(8, 2), nullable=False, default=0)

    attempt = db.relationship("QuizAttempt", back_populates="answers")
    question = db.relationship("Question", back_populates="answers")

    def __repr__(self):
        return f"<QuizAnswer attempt={self.attempt_id} question={self.question_id}>"
