
import jwt from 'jsonwebtoken';


// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Auth Middleware
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }
  
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      req.user = {
        _id: userId,
        userId,
        user_id: userId,
        email: decoded.email,
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
  
