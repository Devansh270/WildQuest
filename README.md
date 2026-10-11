# 🌿 WildQuest — AI-Powered Outdoor Adventures

**Touch grass. Explore your world. Complete real-world quests.**

WildQuest is an AI-powered outdoor adventure application that transforms ordinary walks into exciting exploration missions. Using Google's Gemini AI, it generates personalized nature quests based on your interests, available time, and surroundings.

Whether you're in a city park, walking through your neighborhood, or exploring a garden, WildQuest encourages you to step away from your screen and reconnect with the world around you.

🌐 **Live Demo:** https://wild-quest-4auzlw2dk-devansh-55f9.vercel.app/

---

## ✨ Features

- 🤖 **AI-Generated Quests:** Generate three unique outdoor missions using Google Gemini.
- 🎯 **Personalized Adventures:** Customize your interests, surroundings, and available duration.
- 🌱 **Nature Exploration:** Discover birds, plants, trees, insects, and other natural details.
- ✅ **Interactive Tasks:** Complete mission objectives as you explore.
- 📓 **Field Journal:** Record your outdoor experiences and observations.
- 📊 **Progress Tracking:** Track completed tasks and your exploration progress.
- 🛡️ **Safety-Focused Missions:** Encourage responsible observation without disturbing wildlife or damaging nature.
- 🌍 **Live Web Application:** Access the deployed frontend without installing anything.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Styling | CSS |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| AI | Google Gemini API |
| Data Validation | Pydantic |
| Deployment — Frontend | Vercel |
| Deployment — Backend | Render |

## 🏗️ Architecture

```text
                  User
                   |
                   v
          React + Vite Frontend
                (Vercel)
                   |
             HTTP / JSON
                   |
                   v
            FastAPI Backend
                (Render)
                   |
                   v
             Google Gemini
                   |
                   v
       Three Personalized Quests
                   |
                   v
          Displayed in the UI
```

The frontend sends the user's preferences to the FastAPI backend. The backend calls Gemini, validates the generated quests, and returns structured JSON to the frontend.

**Security:** The Gemini API key stays on the backend and is never intentionally exposed through frontend code.

## 🚀 Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) and npm
- [Python](https://www.python.org/downloads/)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/Devansh270/WildQuest.git
cd WildQuest
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root, alongside `package.json`.

```dotenv
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-3.8-flash
```

Replace `your_gemini_api_key` with your own API key.

**Important:** Never commit `.env` or publish your API key. The repository's `.gitignore` should exclude local environment files.

### 4. Install backend dependencies

Open a terminal in the project root and run:

**Windows PowerShell:**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

If PowerShell blocks virtual environment activation, use Command Prompt:

```bat
.venv\Scripts\activate.bat
```

### 5. Start the backend

From the `backend` directory, run:

```bash
python -m uvicorn main:app --reload --port 8000
```

The backend will run at:

- API: http://127.0.0.1:8000
- Health check: http://127.0.0.1:8000/api/health
- Interactive API documentation: http://127.0.0.1:8000/docs

### 6. Start the frontend

Open a second terminal in the project root and run:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

http://localhost:5173

Keep both the frontend and backend running while using the local application.

## 🔌 API Reference

### `GET /api/health`

Checks the backend status and reports the configured AI provider and model.

Example response:

```json
{
  "status": "ok",
  "app": "WildQuest",
  "provider": "gemini",
  "model": "gemini-3.8-flash",
  "api_key_configured": true
}
```

### `POST /api/quests`

Generates three personalized outdoor quests.

**Request body:**

```json
{
  "duration": 20,
  "interests": ["plants", "birds", "nature"],
  "surroundings": "city park"
}
```

**Example response structure:**

```json
{
  "quests": [
    {
      "title": "Canopy Bird Watch",
      "description": "Explore bird activity in your surroundings.",
      "duration": "7 minutes",
      "tasks": [
        "Listen for different bird calls.",
        "Observe birds from a safe distance.",
        "Notice differences in their appearance."
      ]
    }
  ],
  "model": "gemini-3.8-flash",
  "generated_locally": false
}
```

The actual response contains three quests, each with three tasks.

Interactive API documentation is available at `/docs` when the backend is running.

## ☁️ Deployment

WildQuest uses separate deployments for its frontend and backend.

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/)

Configure the following environment variables in the backend deployment:

| Variable | Purpose |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Authenticates requests to Gemini |
| `AI_PROVIDER` | Selects the Gemini provider |
| `GEMINI_MODEL` | Sets the model used for quest generation |

Configure this variable in Vercel:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | Your deployed backend URL |

After changing Vercel environment variables, redeploy the frontend so the new configuration takes effect.

**Note:** Free hosting instances may take additional time to wake up after inactivity. Gemini API availability and usage limits depend on your Google account and API configuration.

## 🌳 Project Structure

```text
WildQuest/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .venv/             # Local virtual environment (ignored)
├── src/
│   ├── api/
│   │   └── quests.js
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── public/
├── .env                   # Local secrets (ignored)
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

The structure above represents the main project files; additional files may exist in the repository.

## 🔒 Safety and Responsible Exploration

WildQuest is designed to encourage safe, responsible outdoor observation.

- Observe wildlife from a respectful distance.
- Do not touch unfamiliar plants, animals, or insects.
- Stay on permitted paths and avoid roads or restricted areas.
- Leave natural objects where you find them.
- Follow local rules and respect private property.

AI-generated content can occasionally be inaccurate. Use your judgment and prioritize real-world safety.

## 🤝 Contributing

Contributions, suggestions, bug reports, and feature ideas are welcome!

1. Fork this repository.
2. Create a feature branch:

   ```bash
   git checkout -b feat/your-feature
   ```

3. Make your changes and test them locally.
4. Commit your changes:

   ```bash
   git commit -m "feat: describe your change"
   ```

5. Push your branch and open a Pull Request.

Please avoid committing API keys, `.env` files, or other secrets.

## 🗺️ Future Improvements

Potential enhancements include:

- Location-aware quests with explicit user consent.
- Quest difficulty levels and achievement badges.
- More detailed field journal entries.
- Accessibility improvements and additional languages.
- More exploration themes and personalization options.
- Automated tests and improved error handling.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🌱 Explore More. Scroll Less.

WildQuest turns a simple walk into an opportunity to observe, discover, and learn.

**Open WildQuest:** https://wild-quest-4auzlw2dk-devansh-55f9.vercel.app/

Built with curiosity and a little help from AI. 🌿