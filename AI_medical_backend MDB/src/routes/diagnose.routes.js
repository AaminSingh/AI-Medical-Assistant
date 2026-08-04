import { Router } from "express";
import {
    processDiagnosis,
    getConsultationHistory,
    processDietPlan
} from "../controllers/diagnose.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Ensure all routes in this file require the user to be logged in
router.use(verifyJWT);

// The main conversational triage and diagnosis endpoint
router.post("/", processDiagnosis);

// Fetch user's past consultation history
router.get("/history", getConsultationHistory);

// Generate AI diet recommendations
router.post("/diet", processDietPlan);

export default router;