import "dotenv/config";
import fetch from "node-fetch"; // only if Node <18

export async function getGroqResponse(prompt) {
  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) {
    console.error("GROQ_API_KEY missing in env");
    return null;
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const payload = {
    model: "llama-3.3-70b-versatile", // replace with a valid Groq model
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("API request failed with status:", res.status);
      console.error("Response:", errText);
      return null;
    }

    const data = await res.json();
    // Groq returns OpenAI-compatible choices array
    const generatedText = data?.choices?.[0]?.message?.content || "No response";

    return generatedText.trim();
  } catch (err) {
    console.error("Error while fetching Groq response:", err.message);
    return null;
  }
}
