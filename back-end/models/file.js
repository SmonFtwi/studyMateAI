import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    vectorNamespace: {
      type: String,
      default: null,
    },
    vectorIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const File =
  mongoose.models.File || mongoose.model("File", FileSchema);
