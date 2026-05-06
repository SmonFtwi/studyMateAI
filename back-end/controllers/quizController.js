import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { Quiz } from "../models/quiz.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
const pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateQuiz = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    // 1. Fetch context from Pinecone
    const pineconeIndex = pineconeClient.index(pineconeIndexName);
    const queryResponse = await pineconeIndex
      .namespace(projectId.toString())
      .query({
        vector: Array(768).fill(0),
        topK: 10,
        includeMetadata: true,
      });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.chunk || "")
      .join("\n\n");

    if (!contextText.trim()) {
      return res.status(400).json({ error: "No content found in project to generate quiz questions." });
    }

    // 2. Prompt Gemini to generate JSON questions
    const prompt = `
      You are an educational assistant. Based on the following study material, generate 5 high-quality multiple choice questions (MCQs).
      Each question should have:
      1. 'question' (the text of the question)
      2. 'options' (an array of 4 possible answers)
      3. 'correctAnswer' (the text of the correct answer from the options)
      
      Output the result ONLY as a JSON array of objects with keys "question", "options", and "correctAnswer".
      
      Study Material:
      ${contextText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("Failed to parse quiz from AI response");
    }
    
    const questionsData = JSON.parse(jsonMatch[0]);

    // 3. Save to MongoDB
    const savedQuestions = await Promise.all(
      questionsData.map((q) =>
        Quiz.create({
          projectId,
          userId,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          type: "mcq",
        })
      )
    );

    return res.status(201).json({
      message: "Quiz questions generated successfully",
      count: savedQuestions.length,
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;

    const questions = await Quiz.find({ projectId, userId }).sort({ createdAt: -1 });
    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
