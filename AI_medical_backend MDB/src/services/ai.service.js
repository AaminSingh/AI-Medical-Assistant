import Groq from "groq-sdk";
import axios from "axios";

/**
 * Lazily initialised Groq client instance.
 * We keep it outside the functions so the client is created only once.
 */
let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

/** Model to use for all Groq completions */
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── helpers ──────────────────────────────────────────────────────────

/**
 * Attempts to parse a JSON block from the model's response text.
 * Handles both raw JSON and markdown-fenced ```json ... ``` blocks.
 *
 * @param {string} text - Raw model output.
 * @returns {any} Parsed JSON value.
 */
const parseJsonFromResponse = (text) => {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned);
};

// ─── public API ───────────────────────────────────────────────────────

/**
 * Uses Groq to analyze the conversation history.
 * Decides whether to ask a clarifying question or extract final symptoms.
 * 
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: '...' }
 */
export const analyzeConversation = async (messages) => {
  const client = getGroqClient();

  const systemPrompt = `You are an expert AI Medical Assistant conducting a triage interview.
Your goal is to gather comprehensive symptom details from the patient before running a differential diagnosis.

RULES:
1. If the user's symptoms are vague or incomplete, ask ONE relevant, conversational follow-up question (e.g., asking about severity, duration, or accompanying symptoms).
2. Ask a MAXIMUM of 3 questions throughout the entire conversation.
3. If you have enough detailed information to make a prediction, OR if you have already asked 3 questions, you must extract the symptoms into standardized medical terms.
4. You MUST respond ONLY with a JSON object in one of these two exact formats (no markdown, no extra text):

Format A (If you need more info):
{ "type": "question", "text": "Your conversational follow-up question here." }

Format B (If ready for diagnosis):
{ "type": "diagnosis", "symptoms": ["headache", "nausea", "fever"] }`;

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  const chatCompletion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: apiMessages,
    temperature: 0.2,
    max_tokens: 256,
  });

  const response = chatCompletion.choices[0].message.content;
  return parseJsonFromResponse(response);
};

/**
 * Sends extracted symptoms to the external Python ML microservice for
 * disease prediction.
 *
 * @param {string[]} symptomsArray - Standardised symptom keywords.
 * @returns {Promise<Array<{disease: string, probability: number}>>}
 */
export const getPredictions = async (symptomsArray) => {
  try {
    const response = await axios.post(process.env.PYTHON_ML_URL, {
      symptoms: symptomsArray,
    });

    return response.data.predictions;
  } catch (error) {
    console.error("ML Service Error:", error.message);
    return [];
  }
};

/**
 * Uses Groq (LLaMA) to recommend a specialist and generate care tips for a predicted disease.
 *
 * @param {string} disease - The predicted disease name.
 * @returns {Promise<{specialist: string, careTips: string[]}>}
 */
export const getCareInsights = async (disease) => {
  try {
    const client = getGroqClient();

    const chatCompletion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            'You are a medical advisor AI. Provide specialist recommendations and care tips. Return ONLY a JSON object in this exact format — no explanation, no markdown, no extra text: { "specialist": "Specialist Name", "careTips": ["Tip 1", "Tip 2", "Tip 3"] }',
        },
        {
          role: "user",
          content: `For the disease "${disease}", provide:\n1. The most appropriate medical specialist to consult.\n2. Exactly 3 general care tips the patient can follow at home.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 256,
    });

    const response = chatCompletion.choices[0].message.content;
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error("Care Insights Error:", error.message);
    return { specialist: "General Practitioner", careTips: ["Rest", "Stay hydrated", "Consult a doctor if symptoms persist."] };
  }
};

/**
 * Uses Groq (LLaMA) to generate a customized diet plan and macronutrient breakdown.
 *
 * @param {Object} demographics - User health data (weight, height, goal, preference, etc.)
 * @returns {Promise<Object>} Structured JSON response containing the diet plan.
 */
export const generateDietPlan = async (demographics) => {
  try {
    const client = getGroqClient();

    const prompt = `You are an expert clinical AI nutritionist. 
Based on the following patient demographics, calculate their estimated daily caloric needs, provide a macronutrient split (Proteins, Carbs, Fats), and generate a 1-day meal plan.

Patient Data:
- Age: ${demographics.age || 'Unknown'}
- Gender: ${demographics.gender || 'Unknown'}
- Weight: ${demographics.weight ? demographics.weight + ' kg' : 'Unknown'}
- Height: ${demographics.height ? demographics.height + ' cm' : 'Unknown'}
- Fitness Goal: ${demographics.goal || 'General Health'}
- Activity Level: ${demographics.activity || 'Moderate'}
- Diet Preference: ${demographics.preference || 'No preference'}
- Allergies/Conditions: ${demographics.allergies || 'None'}

Return ONLY a JSON object in this exact format (no markdown, no explanations):
{
  "calories": "2200 kcal",
  "protein": "150g",
  "carbs": "200g",
  "fats": "70g",
  "meals": [
    { "name": "Breakfast", "suggestion": "Meal description here" },
    { "name": "Lunch", "suggestion": "Meal description here" },
    { "name": "Dinner", "suggestion": "Meal description here" },
    { "name": "Snack", "suggestion": "Meal description here" }
  ],
  "advice": "One sentence of general nutritional advice."
}`;

    const chatCompletion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are a precise JSON-generating medical AI. Return only valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    const response = chatCompletion.choices[0].message.content;
    return parseJsonFromResponse(response);
  } catch (error) {
    console.error("Groq Diet Planner Error:", error.message);
    throw new Error("Failed to generate diet plan from AI.");
  }
};