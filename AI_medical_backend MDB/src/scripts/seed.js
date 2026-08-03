import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import dotenv from "dotenv";
import { Symptom } from "../models/symptom.models.js";
import { Disease } from "../models/database.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB for seeding..."))
    .catch(err => console.error("MongoDB connection error:", err));

const seedSymptoms = () => {
    console.log("Seeding symptoms...");
    fs.createReadStream(path.join(__dirname, 'Symptom-severity.csv'))
        .pipe(csv())
        .on('data', async (row) => {
            try {
                await Symptom.updateOne(
                    { name: row.Symptom.trim() },
                    { severityWeight: parseInt(row.weight, 10) },
                    { upsert: true }
                );
            } catch (error) {
                console.error(error);
            }
        })
        .on('end', () => console.log('Symptoms seeded.'));
};

const seedDiseases = () => {
    console.log("Seeding diseases...");
    const diseases = {};

    // 1. Read descriptions
    fs.createReadStream(path.join(__dirname, 'symptom_Description.csv'))
        .pipe(csv())
        .on('data', (row) => {
            if (row.Disease) {
                diseases[row.Disease.trim()] = {
                    name: row.Disease.trim(),
                    description: row.Description.trim(),
                    precautions: []
                };
            }
        })
        .on('end', () => {
            // 2. Read precautions and merge
            fs.createReadStream(path.join(__dirname, 'symptom_precaution.csv'))
                .pipe(csv())
                .on('data', async (row) => {
                    const dName = row.Disease.trim();
                    if (diseases[dName]) {
                        diseases[dName].precautions = [
                            row.Precaution_1, row.Precaution_2, row.Precaution_3, row.Precaution_4
                        ].filter(p => p && p.trim() !== ""); // Remove empty precautions

                        try {
                            await Disease.updateOne(
                                { name: dName },
                                diseases[dName],
                                { upsert: true }
                            );
                        } catch (error) {
                            console.error("Error saving disease:", error);
                        }
                    }
                })
                .on('end', () => console.log('Diseases and Precautions seeded.'));
        });
};

// Run the seeders
seedSymptoms();
setTimeout(seedDiseases, 2000); // Wait 2s for symptoms to finish