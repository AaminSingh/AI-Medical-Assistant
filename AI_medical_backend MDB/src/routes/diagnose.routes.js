import { Router } from "express";
import { processDiagnosis } from "../controllers/diagnose.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, processDiagnosis);

export default router;
