import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const prompt = `
You are a Virtual Assistant named ${assistantName}, created by ${userName}.
You are not Google. You will now behave like a voice-enabled Assistant.

Your task is to respond ONLY with a valid JSON object like this:

{
  "type": "general" | "google_search" | "youtube_search" | "youtube_play" | 
           "youtube_open" | "get_time" | "get_date" | "get_day" | "get_month" | "get_year" |
           "calculator_open" | "instagram_open" | "facebook_open" | "weather_show",
  "userInput": "<original user input (remove your name if present)>",
  "response": "<a short spoken response to read aloud to the user>"
}

Important:
- Do NOT include markdown, backticks, or explanations.
- Only output the JSON object.
- If someone asks "Who created you?", respond with: "Created by ${userName}".
- Respond concisely.

User input: "${command}"
`;

    const result = await axios.post(GEMINI_URL, {
      "contents": [{ 
         "parts": [{ "text": prompt }] }]
    });

  

    

    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log(error);
  }
};

export default geminiResponse;
