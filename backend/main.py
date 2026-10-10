
import json
import re

import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="WildQuest API",
    description="Outdoor adventures powered by local Gemma AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class QuestRequest(BaseModel):
    duration: int = Field(default=20, ge=5, le=60)
    interests: list[str] = Field(
        default=["plants", "birds", "nature"],
        max_length=8,
    )
    surroundings: str = Field(default="city park", max_length=120)


class Quest(BaseModel):
    title: str
    description: str
    duration: str
    tasks: list[str]


class QuestResponse(BaseModel):
    quests: list[Quest]
    model: str
    generated_locally: bool


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": "WildQuest",
        "model": "gemma3:4b",
    }


@app.post("/api/quests", response_model=QuestResponse)
def generate_quests(request: QuestRequest):
    prompt = f"""
You create safe, engaging outdoor observation missions.

Generate exactly 3 distinct missions for a {request.duration}-minute
outdoor adventure.

Surroundings: {request.surroundings}
Interests: {", ".join(request.interests)}

Rules:
- Missions must involve observing the real world.
- Never suggest touching unknown plants or disturbing wildlife.
- Never suggest trespassing or approaching roads.
- Do not require collecting plants, insects, or animals.
- Make every task safe and beginner-friendly.
- Each mission must have exactly 3 actionable tasks.
- Return valid JSON only, without markdown fences.

Required structure:
{{
  "quests": [
    {{
      "title": "Mission title",
      "description": "Short description",
      "duration": "10 minutes",
      "tasks": ["Task one", "Task two", "Task three"]
    }}
  ]
}}
"""

    try:
        response = ollama.chat(
            model="gemma3:4b",
            messages=[{"role": "user", "content": prompt}],
            format="json",
            options={"temperature": 0.7},
        )

        content = response["message"]["content"].strip()
        content = re.sub(
            r"^```(?:json)?\s*|\s*```$",
            "",
            content,
            flags=re.IGNORECASE,
        )

        data = json.loads(content)
        quests = [Quest.model_validate(item) for item in data["quests"]]

        if len(quests) != 3:
            raise ValueError("Expected exactly 3 quests.")

        if any(len(quest.tasks) != 3 for quest in quests):
            raise ValueError("Each quest must have exactly 3 tasks.")

        return QuestResponse(
            quests=quests,
            model="gemma3:4b",
            generated_locally=True,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not generate quests. Check Ollama and Gemma. {exc}",
        ) from exc
