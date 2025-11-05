import express from "express";
import {
  getProjects,
  createProject,
  uploadFile,
  getFiles,
  addEmbedding,
  getEmbeddings,
  createFlashcards,
  getFlashcards,
  createSummary,
  getSummaries,
} from "../controllers/projectController.js";

const router = express.Router();

// Project
router.get("/", getProjects);
router.post("/", createProject);

// Files
router.get("/:projectId/files", getFiles);
router.post("/:projectId/files", uploadFile);

// Embeddings
router.get("/:projectId/embeddings", getEmbeddings);
router.post("/:projectId/embeddings", addEmbedding);

// Flashcards
router.get("/:projectId/flashcards", getFlashcards);
router.post("/:projectId/flashcards", createFlashcards);

// Summaries (includes cheatsheet)
router.get("/:projectId/summaries", getSummaries);
router.post("/:projectId/summaries", createSummary);

export default router;
