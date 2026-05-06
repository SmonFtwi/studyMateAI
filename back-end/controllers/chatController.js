import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatSession } from "../models/chatSession.js";
import { ChatMessage } from "../models/chatMessage.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
const pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const createChatSession = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;
    const { title } = req.body || {};

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const session = await ChatSession.create({
      projectId,
      userId,
      title: title || "New chat",
    });

    return res.status(201).json({
      message: "Chat session created",
      session,
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const sessions = await ChatSession.find({ projectId, userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId, sessionId } = req.params;

    if (!projectId || !sessionId) {
      return res.status(400).json({ error: "Missing projectId or sessionId" });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      projectId,
      userId,
    });
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    const messages = await ChatMessage.find({
      sessionId,
      projectId,
      userId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId, sessionId } = req.params;
    const { message } = req.body;

    if (!projectId || !sessionId) {
      return res.status(400).json({ error: "Missing projectId or sessionId" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }
    if (!pineconeIndexName) {
      return res.status(500).json({ error: "Pinecone index not configured" });
    }

    const session = await ChatSession.findOne({
      _id: sessionId,
      projectId,
      userId,
    });
    if (!session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    const userMessage = await ChatMessage.create({
      sessionId,
      projectId,
      userId,
      role: "user",
      content: message,
    });

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: GEMINI_API_KEY,
      model: "text-embedding-004",
    });

    const queryVector = await embeddings.embedQuery(message);
    const pineconeIndex = pineconeClient.index(pineconeIndexName);
    const queryResponse = await pineconeIndex
      .namespace(projectId.toString())
      .query({
        vector: queryVector,
        topK: 6,
        includeMetadata: true,
      });

    const docs = queryResponse.matches || [];
    const contextString = docs
      .map(
        (doc, idx) =>
          `Source ${idx + 1}: ${doc.metadata?.chunk || ""}`.trim()
      )
      .join("\n\n");

    const historyDocs = await ChatMessage.find({
      sessionId,
      projectId,
      userId,
    })
      .sort({ createdAt: 1 })
      .limit(10);

    const historyMessages = historyDocs.map((m) =>
      m.role === "assistant"
        ? new AIMessage(m.content)
        : new HumanMessage(m.content)
    );

    const systemMessage = new SystemMessage(
      "You are StudyMate AI. Answer using only the provided project context. Cite the most relevant points from the context. If unsure, say you are not sure."
    );

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey: GEMINI_API_KEY,
      temperature: 0.2,
    });

    const response = await model.invoke([
      systemMessage,
      new SystemMessage(`Context:\n${contextString || "No context available."}`),
      ...historyMessages,
      new HumanMessage(message),
    ]);

    const assistantMessage = await ChatMessage.create({
      sessionId,
      projectId,
      userId,
      role: "assistant",
      content: response.content,
      sources: docs.map((doc, idx) => ({
        label: `Source ${idx + 1}`,
        score: doc.score,
        metadata: doc.metadata,
      })),
    });

    return res.status(200).json({
      message: assistantMessage,
      sources: docs.map((doc, idx) => ({
        label: `Source ${idx + 1}`,
        score: doc.score,
        metadata: doc.metadata,
      })),
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
