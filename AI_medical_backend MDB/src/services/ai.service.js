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
 * Uses Groq (LLaMA) to extract structured symptom keywords from free-form text.
 *
 * @param {string} text - The patient's raw symptom description.
 * @returns {Promise<string[]>} Array of standardised medical symptom terms.
 *
 * @example
 *   await extractSymptoms("I've had a splitting headache and I keep throwing up");
 *   // → ["headache", "vomiting"]
 */
export const extractSymptoms = async (text) => {
  const client = getGroqClient();

  const chatCompletion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a medical NLP assistant. Extract all symptoms from patient descriptions and map them to standard medical terms. Return ONLY a JSON array of strings — no explanation, no markdown, no extra text.",
      },
      {
        role: "user",
        content: `Extract symptoms from the following patient description.\n\nExample output: ["headache", "vomiting", "fever"]\n\nPatient description:\n"${text}"`,
      },
    ],
    temperature: 0.3,
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
