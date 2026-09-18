class StudyMateError(Exception):
    """Base application error with an HTTP-safe message."""

    status_code = 500

    def __init__(self, message: str, *, code: str = "application_error") -> None:
        super().__init__(message)
        self.message = message
        self.code = code


class NotFoundError(StudyMateError):
    status_code = 404


class ForbiddenError(StudyMateError):
    status_code = 403


class AuthenticationError(StudyMateError):
    status_code = 401


class ValidationError(StudyMateError):
    status_code = 400


class ExternalServiceError(StudyMateError):
    status_code = 503

