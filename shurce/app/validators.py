import re
from typing import Annotated

from pydantic import (
    AfterValidator,
    ValidationError,
    ValidationInfo,
    ValidatorFunctionWrapHandler,
    WrapValidator,
)
from pydantic_core import InitErrorDetails


def validate_email(v):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    assert re.search(pattern, v), "Email is invalid"
    return v


# Email = Annotated[str, AfterValidator(validate_email)]
Email = str


def is_required_length(v):
    assert len(v) >= 8, "Must be at least 8 characters long"
    return v


def contains_small_letter(v):
    print(v)
    assert re.search(r"[a-z]", v), "Must contain small letter"
    return v


def contains_big_letter(v):
    assert re.search(r"[A-Z]", v), "Must contain big letter"
    return v


def contains_number(v):
    assert re.search(r"[0-9]", v), "Must contain a number"
    return v


def contains_special_character(v):
    pattern = r"[ !\"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]"
    assert re.search(pattern, v), "Must contain special character"
    return v


def validate_password(v, handler: ValidatorFunctionWrapHandler, info: ValidationInfo):
    validators = [
        is_required_length,
        contains_small_letter,
        contains_big_letter,
        contains_number,
        contains_special_character,
    ]
    validation_errors = []
    validated_self = handler(v)

    for validator in validators:
        try:
            validator(validated_self)
        except Exception as e:
            validation_errors.append(
                InitErrorDetails(
                    type="assertion_error",
                    loc=(),
                    input=f"{v}",
                    ctx={"error": f"{e}"},
                )
            )

    if validation_errors:
        raise ValidationError.from_exception_data(
            title=f"{info.field_name} is invalid", line_errors=validation_errors
        )

    return validated_self


# Password = Annotated[str, WrapValidator(validate_password)]
Password = str
