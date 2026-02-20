import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  // Onboarding Data
  website: { type: String },
  brandDescription: { type: String },
  region: { type: String, default: "US" },
  language: { type: String, default: "en" },
  onboardingCompleted: { type: Boolean, default: false },
}, { timestamps: true });

export const User = models.User || model("User", UserSchema);