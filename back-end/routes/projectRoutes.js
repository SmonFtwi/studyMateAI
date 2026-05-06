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
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  sendChatMessage,
} from "../controllers/chatController.js";
import {
  generateFlashcards,
  getFlashcards,
  deleteFlashcard,
} from "../controllers/flashcardController.js";
import {
  generateQuiz,
  getQuiz,
} from "../controllers/quizController.js";
import { authMiddleware } from "../MiddleWares/auth.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// Project Management
router.get("/getProjects", authMiddleware, getProjects);
router.post("/createProject", authMiddleware, createProject);
router.delete("/deleteProject/:project_id", authMiddleware, deleteProject);
router.get("/:projectId/files", authMiddleware, getProjectFiles);
router.post("/:projectId/sources", authMiddleware, upload.array("files"), uploadProjectFiles);

// Chat
router.post("/:projectId/chat/sessions", authMiddleware, createChatSession);
router.get("/:projectId/chat/sessions", authMiddleware, getChatSessions);
router.get("/:projectId/chat/:sessionId/messages", authMiddleware, getChatMessages);
router.post("/:projectId/chat/:sessionId/messages", authMiddleware, sendChatMessage);

// Flashcards
router.get("/:projectId/flashcards", authMiddleware, getFlashcards);
router.post("/:projectId/flashcards/generate", authMiddleware, generateFlashcards);
router.delete("/:projectId/flashcards/:id", authMiddleware, deleteFlashcard);

// Quizzes
router.get("/:projectId/quiz", authMiddleware, getQuiz);
router.post("/:projectId/quiz/generate", authMiddleware, generateQuiz);

export default router;
