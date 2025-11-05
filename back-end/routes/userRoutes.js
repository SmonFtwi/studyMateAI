// --- routes/userRoutes.js ---
import express from 'express';
import { register, login, checkAuth } from "../controllers/userControllers.js"

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/checkAuth', checkAuth);

export default router;