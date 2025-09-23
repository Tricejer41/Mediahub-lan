from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base
from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    UniqueConstraint,
    Float,
    Boolean,
    BigInteger,
)
from datetime import datetime
from sqlalchemy import DateTime


class Series(Base):
    __tablename__ = "series"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    poster_rel: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seasons: Mapped[list["Season"]] = relationship(
        back_populates="series", cascade="all,delete-orphan"
    )


class Season(Base):
    __tablename__ = "seasons"
    id: Mapped[int] = mapped_column(primary_key=True)
    series_id: Mapped[int] = mapped_column(
        ForeignKey("series.id", ondelete="CASCADE"), index=True
    )
    number: Mapped[int] = mapped_column(Integer, index=True)

    series: Mapped["Series"] = relationship(back_populates="seasons")
    episodes: Mapped[list["Episode"]] = relationship(
        back_populates="season", cascade="all,delete-orphan"
    )
    __table_args__ = (
        UniqueConstraint("series_id", "number", name="uq_season_series_number"),
    )


class Episode(Base):
    __tablename__ = "episodes"
    id: Mapped[int] = mapped_column(primary_key=True)
    season_id: Mapped[int] = mapped_column(
        ForeignKey("seasons.id", ondelete="CASCADE"), index=True
    )
    number: Mapped[int | None] = mapped_column(Integer, nullable=True)

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    path: Mapped[str] = mapped_column(
        String(2048), unique=True
    )  # ruta absoluta en el NAS
    size_bytes: Mapped[int] = mapped_column(BigInteger)
    duration_sec: Mapped[float | None] = mapped_column(Float, nullable=True)
    vcodec: Mapped[str | None] = mapped_column(String(64), nullable=True)
    acodec: Mapped[str | None] = mapped_column(String(64), nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    thumb_rel: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # <--- nuevo

    season: Mapped["Season"] = relationship(back_populates="episodes")


class Profile(Base):
    __tablename__ = "profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    avatar: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # "kids", "red", etc.
    is_kid: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class WatchProgress(Base):
    __tablename__ = "watch_progress"
    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profiles.id", ondelete="CASCADE"), index=True
    )
    episode_id: Mapped[int] = mapped_column(
        ForeignKey("episodes.id", ondelete="CASCADE"), index=True
    )
    position_sec: Mapped[float] = mapped_column(Float, default=0)  # última posición
    duration_sec: Mapped[float | None] = mapped_column(Float, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (
        UniqueConstraint(
            "profile_id", "episode_id", name="uq_progress_profile_episode"
        ),
    )
