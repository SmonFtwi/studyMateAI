import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    options: [{ type: String }], // For MCQ
    correctAnswer: { type: String, required: true },
    type: { type: String, enum: ["mcq", "short_answer"], default: "mcq" },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", QuizSchema);
