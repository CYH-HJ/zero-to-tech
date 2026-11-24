import sqlite3
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from pypinyin import Style, lazy_pinyin
from snownlp import SnowNLP

DATABASE_PATH = Path(__file__).resolve().parent / "history.sqlite3"


@contextmanager
def connect_database():
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    try:
        with connection:
            yield connection
    finally:
        connection.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    with connect_database() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS analysis_history (
                id INTEGER PRIMARY KEY,
                text TEXT NOT NULL,
                pinyin TEXT NOT NULL,
                score REAL NOT NULL,
                sentiment TEXT NOT NULL,
                analyzed_at TEXT NOT NULL
            )
        """)
    yield


app = FastAPI(title="文字实验室", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class AnalyzeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def validate_text(cls, text: str) -> str:
        if not text.strip():
            raise ValueError("请输入要分析的文本")
        return text


class AnalyzeResponse(BaseModel):
    text: str
    pinyin: str
    score: float
    sentiment: Literal["偏消极", "中性", "偏积极"]


class HistoryRecord(AnalyzeResponse):
    id: int
    analyzed_at: str


@app.get("/api/history", response_model=list[HistoryRecord])
def history():
    with connect_database() as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            "SELECT * FROM analysis_history ORDER BY analyzed_at DESC, id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    score = SnowNLP(request.text).sentiments
    if score <= 0.4:
        sentiment = "偏消极"
    elif score >= 0.6:
        sentiment = "偏积极"
    else:
        sentiment = "中性"

    result = AnalyzeResponse(
        text=request.text,
        pinyin=" ".join(lazy_pinyin(request.text, style=Style.TONE)),
        score=score,
        sentiment=sentiment,
    )

    with connect_database() as connection:
        connection.execute(
            """INSERT INTO analysis_history
               (text, pinyin, score, sentiment, analyzed_at)
               VALUES (?, ?, ?, ?, ?)""",
            (result.text, result.pinyin, result.score, result.sentiment,
             datetime.now(timezone.utc).isoformat(timespec="microseconds")),
        )
    return result
