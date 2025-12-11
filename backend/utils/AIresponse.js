import "dotenv/config";
import fetch from "node-fetch"; // only if Node <18

export async function getGroqResponse(prompt) {
  const API_KEY = process.env.GROQ_API_KEY?.trim();
  if (!API_KEY) {
    console.error("GROQ_API_KEY missing in env");
    return {
      error: true,
      message: "AI service is not configured. Please contact support.",
      type: "CONFIG_ERROR"
    };
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const payload = {
    model: "llama-3.3-70b-versatile",
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

      // Handle specific error codes
      if (res.status === 429) {
        return {
          error: true,
          message: "Rate limit exceeded. Please try again in a few moments.",
          type: "RATE_LIMIT"
        };
      } else if (res.status === 401) {
        return {
          error: true,
          message: "AI service authentication failed. Please contact support.",
          type: "AUTH_ERROR"
        };
      } else if (res.status === 503 || res.status === 500) {
        return {
          error: true,
          message: "AI service is temporarily unavailable. Please try again later.",
          type: "SERVICE_UNAVAILABLE"
        };
      } else {
        return {
          error: true,
          message: "Failed to get AI response. Please try again.",
          type: "API_ERROR"
        };
      }
    }

    const data = await res.json();
    const generatedText = data?.choices?.[0]?.message?.content || "No response";

    return { error: false, message: generatedText.trim() };
  } catch (err) {
    console.error("Error while fetching Groq response:", err.message);

    // Check if it's a network/timeout error
    if (err.message.includes('fetch') || err.message.includes('network')) {
      return {
        error: true,
        message: "Network error. Please check your connection and try again.",
        type: "NETWORK_ERROR"
      };
    }

    return {
      error: true,
      message: "An unexpected error occurred. Please try again.",
      type: "UNKNOWN_ERROR"
    };
  }
}

