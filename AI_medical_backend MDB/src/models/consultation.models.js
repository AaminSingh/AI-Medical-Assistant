import mongoose, { Schema } from "mongoose";

const consultationSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
      index: true,
    },
    rawSymptoms: {
      type: String,
      required: [true, "Raw symptoms description is required"],
    },
    nlpKeywords: {
      type: [String],
      default: [],
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    predictions: [
      {
        disease: {
          type: String,
        },
        probability: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    recommendedSpecialist: {
      type: String,
    },
    careTips: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Consultation = mongoose.model(
  "Consultation",
  consultationSchema
);
