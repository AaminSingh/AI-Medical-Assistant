import mongoose, { Schema } from "mongoose";

const symptomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    severityWeight: {
        type: Number,
        required: true
    }
});

export const Symptom = mongoose.model("Symptom", symptomSchema);
