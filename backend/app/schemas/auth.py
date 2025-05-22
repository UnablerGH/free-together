from typing import Annotated
from pydantic import BaseModel, EmailStr
from pydantic.types import StringConstraints

class SignupModel(BaseModel):
    email: EmailStr
    password: Annotated[
        str,
        StringConstraints(min_length=6),
    ]
    username: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=30),
    ]
