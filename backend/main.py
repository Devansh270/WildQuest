
import json
import os
import re
import traceback
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# Load WildQuest/.env when running locally.
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.1-flash")
API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
)

app = FastAPI(
    title="WildQuest API",
    description="Outdoor adventures powered by Gemini AI",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://wild-quest-psi.vercel.app",
        "https://wild-quest-4auzlw2dk-devansh-55f9.vercel.app",
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


def build_prompt(request: QuestRequest) -> str:
    return f"""
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


def generate_gemini_quests(request: QuestRequest) -> list[Quest]:
    if not API_KEY:
        raise RuntimeError(
            "Gemini API key is missing. Configure it in the backend environment."
        )

    client = genai.Client(api_key=API_KEY)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=build_prompt(request),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    content = response.text.strip()
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

    return quests


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": "WildQuest",
        "provider": "gemini",
        "model": GEMINI_MODEL,
        "api_key_configured": bool(API_KEY),
    }


@app.post("/api/quests", response_model=QuestResponse)
def generate_quests(request: QuestRequest):
    try:
        quests = generate_gemini_quests(request)
        return QuestResponse(
            quests=quests,
            model=GEMINI_MODEL,
            generated_locally=False,
        )
    except Exception as exc:
        # Print the actual failure in the backend logs for debugging.
        print(f"Gemini quest generation failed: {exc}")
        traceback.print_exc()

        raise HTTPException(
            status_code=502,
            detail="Could not generate quests. Check the backend logs.",
        ) from exc
