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

/* ----------------------------- File Model ------------------------------ */
const FileSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  filename: { type: String, required: true },
  fileType: { type: String }, // pdf, docx, txt
  textContent: { type: String }, // extracted text
  uploadedAt: { type: Date, default: Date.now },
});

export const Project = mongoose.model("Project", ProjectSchema);
export const File = mongoose.model("File", FileSchema);
