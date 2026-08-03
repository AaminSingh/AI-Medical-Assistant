import { Disease } from "../models/database.model.js";
import { Consultation } from "../models/consultation.models.js";

/**
 * Dev B calls this to look up a disease so she can get the description
 * and the precautions array to send back to the React UI.
 */
export const getDiseaseDetails = async (diseaseName) => {
    try {
        const disease = await Disease.findOne({ name: diseaseName });
        return disease; // Returns { name, description, precautions: [] }
    } catch (error) {
        console.error("Database Error:", error);
        return null;
    }
};

/**
 * Dev B calls this to save the final consultation data to the database.
 */
export const saveConsultation = async (patientId, rawText, symptomsList, predictionsList) => {
    try {
        const newRecord = await Consultation.create({
            patientId: patientId,
            rawSymptoms: rawText,
            nlpKeywords: symptomsList,
            predictions: predictionsList
        });
        return newRecord;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to save consultation.");
    }
};
