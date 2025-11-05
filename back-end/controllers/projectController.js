// fileController.js
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { ObjectId } from "mongodb";
import path from "path";

// Import your text extraction functions
import {
  extractTextFromPDF,
  extractTextFromDoc,
  extractTextFromExcel,
  extractTextFromCSV,
} from "../utils/textExtractor.js";

// Import your config
import { geminiConfig, pineconeConfig, mongoDb } from "../config/config.js";

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: pineconeConfig.apiKey,
});

const pineconeIndex = pinecone.index(pineconeConfig.indexName);

// Initialize Google Embeddings
const embeddingsGoogle = new GoogleGenerativeAIEmbeddings({
  apiKey: geminiConfig.apiKey,
  model: "text-embedding-004",
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Text Embedding",
});

/**
 * Generates an embedding for a given text
 */
export const generateEmbedding = async (text) => {
  try {
    if (!text || text.trim() === "") {
      throw new Error("Input text is empty or invalid.");
    }

    const encoder = new TextEncoder();
    const size = encoder.encode(text).length;

    if (size > 10000) {
      throw new Error(`Text size exceeds limit: ${size} bytes`);
    }

    const embedding = await embeddingsGoogle.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Chunks text into smaller pieces
 */
export const chunkText = (text, maxBytes = 8000) => {
  const encoder = new TextEncoder();
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    const wordBytes = encoder.encode(word + " ").length;
    const chunkBytes = encoder.encode(currentChunk).length;

    if (chunkBytes + wordBytes > maxBytes) {
      chunks.push(currentChunk.trim());
      currentChunk = word + " ";
    } else {
      currentChunk += word + " ";
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Uploads chunks to Pinecone
 */
const uploadChunksToPinecone = async (embeddedChunks, fileId, projectId) => {
  try {
    const vectors = embeddedChunks.map((chunk) => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: {
        text: chunk.text,
        fileId: fileId.toString(),
        projectId: projectId.toString(),
        chunkIndex: chunk.index,
      },
    }));

    await pineconeIndex.upsert(vectors);
    console.log(`Successfully uploaded ${vectors.length} vectors to Pinecone`);
  } catch (error) {
    console.error("Error uploading to Pinecone:", error.message);
    throw new Error(`Failed to upload vectors to Pinecone: ${error.message}`);
  }
};

/**
 * Upload file handler - MINIMAL VERSION
 */
export const uploadPdfFile = async (req, res) => {
  const user_id = req.user.user_id;
  const { project_id } = req.body;

  try {
    // Validate project_id
    if (!project_id) {
      return res.status(400).json({ error: "project_id is required" });
    }

    // Verify project exists and belongs to user
    const projectsCollection = mongoDb.collection("projects");
    const project = await projectsCollection.findOne({
      _id: new ObjectId(project_id),
      user_id: user_id,
    });

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const allowedExtensions = [
      ".pdf",
      ".txt",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
    ];
    const results = [];

    for (const file of req.files) {
      const fileBuffer = file.buffer;
      const filename = file.originalname;
      const fileExtension = path.extname(filename).toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        results.push({
          filename,
          status: "failed",
          reason: `Unsupported file type`,
        });
        continue;
      }

      try {
        // Extract text based on file type
        let text;
        if (fileExtension === ".pdf") {
          text = await extractTextFromPDF(fileBuffer);
        } else if (fileExtension === ".txt") {
          text = fileBuffer.toString("utf8");
        } else if (fileExtension === ".doc" || fileExtension === ".docx") {
          text = await extractTextFromDoc(fileBuffer);
        } else if (fileExtension === ".xls" || fileExtension === ".xlsx") {
          text = await extractTextFromExcel(fileBuffer);
        } else if (fileExtension === ".csv") {
          text = await extractTextFromCSV(fileBuffer);
        }

        if (!text || text.trim() === "") {
          results.push({
            filename,
            status: "failed",
            reason: "No text could be extracted",
          });
          continue;
        }

        // Chunk text
        const chunks = chunkText(text);

        // Create file document in MongoDB
        const filesCollection = mongoDb.collection("files");
        const fileDoc = {
          user_id: user_id,
          project_id: new ObjectId(project_id),
          filename: filename,
          file_type: fileExtension,
          upload_date: new Date(),
          chunk_count: chunks.length,
        };

        const fileResult = await filesCollection.insertOne(fileDoc);
        const fileId = fileResult.insertedId;

        // Generate embeddings
        const embeddedChunks = await Promise.all(
          chunks.map(async (chunk, index) => ({
            id: `${fileId.toString()}-chunk-${index}`,
            text: chunk,
            embedding: await generateEmbedding(chunk),
            index: index,
          }))
        );

        // Upload to Pinecone
        await uploadChunksToPinecone(embeddedChunks, fileId, project_id);

        results.push({
          filename,
          status: "success",
          file_id: fileId.toString(),
          chunks: chunks.length,
        });
      } catch (processError) {
        console.error(`Error processing ${filename}:`, processError.message);
        results.push({
          filename,
          status: "failed",
          reason: processError.message,
        });
      }
    }

    res.status(200).json({
      status: "success",
      results,
    });
  } catch (error) {
    console.error("Error during file upload:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
