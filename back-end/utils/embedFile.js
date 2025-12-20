import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from "@pinecone-database/pinecone";
import {
  extractTextFromCSV,
  extractTextFromDoc,
  extractTextFromExcel,
  extractTextFromPDF,
} from "./textExtractor.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;
const embeddingModel = genAI
  ? genAI.getGenerativeModel({
      model: "text-embedding-004",
    })
  : null;

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

const chunkText = (text, size = 1000, overlap = 200) => {
  if (!text) return [];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + size);
    chunks.push(text.slice(start, end));
    start += size - overlap;
  }
  return chunks;
};

const embedText = async (text) => {
  if (!embeddingModel) {
    throw new Error("Gemini API key is not configured");
  }
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};

const extractTextByExtension = async (fileBuffer, extension) => {
  switch (extension) {
    case ".pdf":
      return extractTextFromPDF(fileBuffer);
    case ".doc":
    case ".docx":
      return extractTextFromDoc(fileBuffer);
    case ".xls":
    case ".xlsx":
      return extractTextFromExcel(fileBuffer);
    case ".csv":
      return extractTextFromCSV(fileBuffer);
    default:
      return fileBuffer.toString("utf8");
  }
};

export const embedFileToVectorDB = async (
  filePath,
  projectId,
  fileId,
  filename
) => {
  if (!pineconeIndexName) {
    throw new Error("Pinecone index name is not configured");
  }

  const namespace = projectId?.toString();
  if (!namespace) {
    throw new Error("Project ID is required to namespace vectors");
  }

  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(filename || filePath).toLowerCase();
  const textContent = await extractTextByExtension(buffer, extension);

  if (!textContent || !textContent.trim()) {
    throw new Error(`No text could be extracted from ${filename || filePath}`);
  }

  const chunks = chunkText(textContent);
  const index = pinecone.index(pineconeIndexName).namespace(namespace);

  const vectors = await Promise.all(
    chunks.map(async (chunk, idx) => {
      const values = await embedText(chunk);
      return {
        id: `${fileId}-${idx}`,
        values,
        metadata: {
          projectId,
          fileId: fileId?.toString(),
          filename,
          extension,
          chunk,
        },
      };
    })
  );

  await index.upsert(vectors);

  return { chunkCount: vectors.length };
};
