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
    temperature: 0.2, // Low temperature for consistent JSON formatting
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
 *          Predicted diseases with probability scores.
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
 * Uses Groq (LLaMA) to recommend a specialist and generate care tips for a
 * predicted disease.
 *
 * @param {string} disease - The predicted disease name.
 * @returns {Promise<{specialist: string, careTips: string[]}>}
 *
 * @example
 *   await getCareInsights("Migraine");
 *   // → { specialist: "Neurologist", careTips: ["Rest in a dark room", ...] }
 */
export const getCareInsights = async (disease) => {
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
};