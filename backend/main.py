from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from pypinyin import Style, lazy_pinyin
from snownlp import SnowNLP

app = FastAPI(title="文字实验室")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
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


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    score = SnowNLP(request.text).sentiments
    if score <= 0.4:
        sentiment = "偏消极"
    elif score >= 0.6:
        sentiment = "偏积极"
    else:
        sentiment = "中性"

    return AnalyzeResponse(
        text=request.text,
        pinyin=" ".join(lazy_pinyin(request.text, style=Style.TONE)),
        score=score,
        sentiment=sentiment,
    )
