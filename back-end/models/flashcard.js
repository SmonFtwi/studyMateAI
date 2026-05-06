import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    mastered: { type: Boolean, default: false },
    sourceFileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" }, // Optional reference to source
  },
  { timestamps: true }
);

export const Flashcard = mongoose.model("Flashcard", FlashcardSchema);
