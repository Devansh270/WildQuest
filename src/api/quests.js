
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function generateQuests({
  duration = 20,
  interests = ["plants", "birds", "nature"],
  surroundings = "city park",
} = {}) {
  const response = await fetch(`${API_BASE_URL}/api/quests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      duration,
      interests,
      surroundings,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Quest generation failed (${response.status}): ${message}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.quests) || data.quests.length === 0) {
    throw new Error("The AI returned no quests. Please try again.");
  }

  return data;
}
