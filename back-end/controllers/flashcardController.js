import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import { Flashcard } from "../models/flashcard.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
const pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateFlashcards = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    // 1. Fetch some context from Pinecone
    const pineconeIndex = pineconeClient.index(pineconeIndexName);
    const queryResponse = await pineconeIndex
      .namespace(projectId.toString())
      .query({
        vector: Array(768).fill(0), // Dummy vector to get some matches
        topK: 10,
        includeMetadata: true,
      });

    const contextText = queryResponse.matches
      .map((match) => match.metadata?.chunk || "")
      .join("\n\n");

    if (!contextText.trim()) {
      return res.status(400).json({ error: "No content found in project to generate flashcards." });
    }

    // 2. Prompt Gemini to generate JSON flashcards
    const prompt = `
      You are an educational assistant. Based on the following study material, generate 5-8 high-quality flashcards.
      Each flashcard should have a 'question' and an 'answer'.
      Keep the questions concise and the answers clear.
      
      Output the result ONLY as a JSON array of objects with keys "question" and "answer".
      
      Study Material:
      ${contextText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("Failed to parse flashcards from AI response");
    }
    
    const cardsData = JSON.parse(jsonMatch[0]);

    // 3. Save to MongoDB
    const savedCards = await Promise.all(
      cardsData.map((card) =>
        Flashcard.create({
          projectId,
          userId,
          question: card.question,
          answer: card.answer,
        })
      )
    );

    return res.status(201).json({
      message: "Flashcards generated successfully",
      count: savedCards.length,
      flashcards: savedCards,
    });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getFlashcards = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;

    const flashcards = await Flashcard.find({ projectId, userId }).sort({ createdAt: -1 });
    return res.status(200).json({ flashcards });
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteFlashcard = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { id } = req.params;

    await Flashcard.findOneAndDelete({ _id: id, userId });
    return res.status(200).json({ message: "Flashcard deleted" });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
