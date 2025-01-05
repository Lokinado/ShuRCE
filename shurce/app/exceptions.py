from fastapi import HTTPException, status

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

incorrect_username_or_password = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect username or password",
    headers={"WWW-Authenticate": "Bearer"},
)

insufficient_permissions = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Insufficient permissions",
)

job_folder_already_exists = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Job folder already exists. Please try again",
)

job_folder_does_not_exist = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Job folder does not exist. Please try again",
)

execution_template_does_not_exist = HTTPException(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    detail="Execution template does not exist. Please try again",
)

unauthorized_access_to_job_log = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Unauthorized access to job log",
)

unauthorized_access_to_job_archive = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Unauthorized access to job archive",
)
