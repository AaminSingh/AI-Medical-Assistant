import mongoose, { Schema } from "mongoose";

const diseaseSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    precautions: {
        type: [String], // Native MongoDB array for precautions
        default: []
    }
});

export const Disease = mongoose.model("Disease", diseaseSchema);