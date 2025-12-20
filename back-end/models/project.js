import mongoose from "mongoose";

/* ---------------------------- Project Model ---------------------------- */
const ProjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", ProjectSchema);
