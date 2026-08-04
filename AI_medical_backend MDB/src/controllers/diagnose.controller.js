import { Consultation } from "../models/consultation.models.js";
import { checkRedFlags } from "../services/triage.service.js";
import {
  analyzeConversation,
  getPredictions,
  getCareInsights,
  generateDietPlan // <-- ADDED THIS IMPORT
} from "../services/ai.service.js";
import { getDiseaseDetails } from "../services/database.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * GET /api/v1/diagnose/history
 * Fetches all past consultations for the authenticated user.
 */
export const getConsultationHistory = asyncHandler(async (req, res) => {
  // Find all consultations for this patient, sorted by newest first
  const history = await Consultation.find({ patientId: req.user._id })
    .sort({ createdAt: -1 })
    // Only select the fields we need for the UI table to save bandwidth
    .select("createdAt rawSymptoms predictions isEmergency recommendedSpecialist");

  return res.status(200).json(
    new ApiResponse(200, history, "Patient history retrieved successfully")
  );
});

/**
 * POST /api/v1/diagnose/diet
 * Generates an AI diet plan based on user demographics.
 */
export const processDietPlan = asyncHandler(async (req, res) => {
  const demographics = req.body;

  if (!demographics || Object.keys(demographics).length === 0) {
    throw new ApiError(400, "Health demographics data is required.");
  }

  // Call the Groq AI service
  const dietPlan = await generateDietPlan(demographics);

  if (!dietPlan) {
    throw new ApiError(500, "Failed to generate diet recommendations.");
  }

  return res.status(200).json(
    new ApiResponse(200, dietPlan, "Diet plan generated successfully")
  );
});

/**
 * POST /api/v1/diagnose
 *
 * Full diagnosis pipeline:
 *   1. Red-flag triage check
 *   2. Conversational Triage (Groq)
 *   3. ML disease prediction (Python microservice)
 *   4. Fetch official disease details (MongoDB) & Gemini care insights
 *   5. Persist to Consultation collection
 */
export const processDiagnosis = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, "Conversation history is required");
  }

  // Extract the latest user message for the emergency triage check
  const latestUserMessage = messages[messages.length - 1].content;

  // ── Step 1: Red-flag triage ──────────────────────────────────────────

  const isEmergency = checkRedFlags(latestUserMessage);

  if (isEmergency) {
    // Persist the emergency consultation
    await Consultation.create({
      patientId: req.user._id,
      rawSymptoms: latestUserMessage,
      isEmergency: true,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isEmergency: true,
          message:
            "⚠️ Emergency symptoms detected! Please call emergency services or visit the nearest emergency room immediately.",
        },
        "Emergency triage triggered"
      )
    );
  }

  // ── Step 2: Conversational Triage & Extraction ───────────────────────

  const analysis = await analyzeConversation(messages);

  // If the AI decides it needs more information, send the question back
  if (analysis.type === 'question') {
    return res.status(200).json(
      new ApiResponse(200, { type: 'question', text: analysis.text }, "Question generated")
    );
  }

  // Otherwise, the AI is ready. Grab the extracted symptoms!
  const extractedSymptoms = analysis.symptoms;

  if (!extractedSymptoms || extractedSymptoms.length === 0) {
    throw new ApiError(
      422,
      "Could not extract any symptoms from the provided text"
    );
  }

  // ── Step 3: ML disease predictions ───────────────────────────────────

  const predictions = await getPredictions(extractedSymptoms);

  // Determine the top predicted disease
  const topPrediction =
    predictions && predictions.length > 0
      ? predictions.reduce((prev, curr) =>
        curr.probability > prev.probability ? curr : prev
      )
      : null;

  // ── Step 4: Care insights & Official DB Details ────────────────────────

  let specialist = null;
  let careTips = [];
  let officialDiseaseInfo = null;

  if (topPrediction) {
    // 1. Get dynamic insights from Gemini
    const insights = await getCareInsights(topPrediction.disease);
    specialist = insights.specialist || null;
    careTips = insights.careTips || [];

    // 2. Get official description & precautions from MongoDB (Seeded CSV data)
    officialDiseaseInfo = await getDiseaseDetails(topPrediction.disease);
  }

  // ── Step 5: Persist consultation ─────────────────────────────────────

  // Compile the full history of user symptoms for the database
  const fullSymptomHistory = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(" | ");

  const consultation = await Consultation.create({
    patientId: req.user._id,
    rawSymptoms: fullSymptomHistory,
    nlpKeywords: extractedSymptoms,
    isEmergency: false,
    predictions: predictions || [],
    recommendedSpecialist: specialist,
    careTips,
  });

  // ── Response ─────────────────────────────────────────────────────────

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        consultationId: consultation._id,
        isEmergency: false,
        extractedSymptoms,
        predictions,
        topPrediction,
        recommendedSpecialist: specialist,
        careTips, // From Gemini
        diseaseDetails: officialDiseaseInfo // From MongoDB
      },
      "Diagnosis completed successfully"
    )
  );
});