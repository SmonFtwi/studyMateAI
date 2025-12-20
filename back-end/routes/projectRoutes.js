import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  createProject,
  getProjects,
  deleteProject,
  uploadProjectFiles,
  getProjectFiles,
} from "../controllers/projectController.js";
import { authMiddleware } from "../MiddleWares/auth.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

// Project
router.get("/getProjects", authMiddleware, getProjects);
router.post("/createProject", authMiddleware, createProject);
router.delete("/deleteProject/:project_id", authMiddleware, deleteProject);
router.post(
  "/:projectId/sources",
  authMiddleware,
  upload.array("files"),
  uploadProjectFiles
);
router.get("/:projectId/files", authMiddleware, getProjectFiles);

// // Files
// router.get("/:projectId/files", getFiles);
// router.post("/:projectId/files", uploadFile);

// // Embeddings
// router.get("/:projectId/embeddings", getEmbeddings);
// router.post("/:projectId/embeddings", addEmbedding);

// // Flashcards
// router.get("/:projectId/flashcards", getFlashcards);
// router.post("/:projectId/flashcards", createFlashcards);

// // Summaries (includes cheatsheet)
// router.get("/:projectId/summaries", getSummaries);
// router.post("/:projectId/summaries", createSummary);

export default router;
