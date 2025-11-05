import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import  sanitizeInput  from '../utils/sanitize.js';

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;



export const register = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;
    const name = sanitizeInput(req.body.name);

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("user created")

    res.status(201).json({
      message: 'User registered',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};


// Login Controller
export const login = async (req, res) => {
  try {
    const email = sanitizeInput(req.body.email);
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
};


export const checkAuth = async (req, res) => {
    const { token } = req.body;
  
    console.log("token, token")
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decode", decoded)
      const user = await User.findById(decoded.userId).select('name email');
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.status(200).json({ name: user.name, email: user.email });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };