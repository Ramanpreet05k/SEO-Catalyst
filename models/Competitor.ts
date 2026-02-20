import mongoose, { Schema, model, models } from "mongoose";

const CompetitorSchema = new Schema({
  // This links the competitor specifically to the user who added them
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  name: { type: String, required: true },
  url: { type: String, default: "" },
}, { timestamps: true });

export const Competitor = models.Competitor || model("Competitor", CompetitorSchema);