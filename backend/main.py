
import json
import os
import re

import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="WildQuest API",
    description="Outdoor adventures powered by AI",
    version="1.1.0",
)

# Local Vite frontend + deployed Vercel frontend
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


@app.get("/api/health")
def health():
    provider = (
        "gemini"
        if os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        else "ollama"
    )
    return {
        "status": "ok",
        "app": "WildQuest",
        "model": "gemini" if provider == "gemini" else "gemma3:4b",
        "provider": provider,
    }


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


def validate_quests(content: str) -> list[Quest]:
    content = content.strip()
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


def generate_with_ollama(prompt: str) -> list[Quest]:
    response = ollama.chat(
        model="gemma3:4b",
        messages=[{"role": "user", "content": prompt}],
        format="json",
        options={"temperature": 0.7},
    )
    return validate_quests(response["message"]["content"])


def generate_with_gemini(prompt: str) -> list[Quest]:
    from google import genai
    from google.genai import types

    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
    )
    if not api_key:
        raise RuntimeError("Gemini API key is not configured.")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash"),
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
        ),
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    return validate_quests(response.text)


@app.post("/api/quests", response_model=QuestResponse)
def generate_quests(request: QuestRequest):
    prompt = build_prompt(request)

    # Explicit provider setting wins. Otherwise, use Gemini when its
    # key exists, and Ollama when running locally without a Gemini key.
    provider = os.getenv("AI_PROVIDER", "").strip().lower()

    if provider not in ("", "gemini", "ollama"):
        raise HTTPException(
            status_code=500,
            detail="AI_PROVIDER must be 'gemini' or 'ollama'.",
        )

    use_gemini = (
        provider == "gemini"
        or (
            provider == ""
            and bool(
                os.getenv("GEMINI_API_KEY")
                or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
            )
        )
    )

    try:
        if use_gemini:
            quests = generate_with_gemini(prompt)
            return QuestResponse(
                quests=quests,
                model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                generated_locally=False,
            )

        quests = generate_with_ollama(prompt)
        return QuestResponse(
            quests=quests,
            model="gemma3:4b",
            generated_locally=True,
        )

    except Exception as exc:
        # Keep secrets out of public error responses and logs.
        print(f"Quest generation failed ({'gemini' if use_gemini else 'ollama'}): {exc}")
        raise HTTPException(
            status_code=502,
            detail=(
                "Could not generate quests. Please try again later."
                if use_gemini
                else "Could not generate quests. Check that Ollama and Gemma are running."
            ),
        ) from exc
