from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy import Column, ForeignKey, Integer, String, ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship

from api.database import Base

import uuid


class Sheet(Base):
    __tablename__ = "sheets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", back_populates="sheets")

    __table_args__ = (
        UniqueConstraint("project_id", "name", name="_project_name_uc"),
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    github_remote = Column(String)
    github_cwd = Column(String, default=".")
    github_access_token = Column(String)
    user_ids = Column(
        ARRAY(Integer), nullable=True
    )  # array because users will end up in a own microservice
    publish_token = Column(String, default=lambda: str(uuid.uuid4().hex), unique=True)
    sheets_token = Column(String, default=lambda: str(uuid.uuid4().hex), unique=True)

    sheets = relationship("Sheet", back_populates="project")
