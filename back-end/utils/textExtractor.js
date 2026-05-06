import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { Poppler } from "node-poppler";
import xlsx from "node-xlsx";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Temporary directory for images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, "temp-images");

if (!fs.existsSync(TEMP_DIR)) {
  console.log("TEMP_DIR does not exist. Creating...");
  fs.mkdirSync(TEMP_DIR, { recursive: true });
} else {
  console.log("TEMP_DIR exists.");
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const visionModel = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

const extractTextWithGemini = async (fileBuffer, mimeType) => {
  if (!visionModel) return null;
  try {
    const result = await visionModel.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType,
        },
      },
      "Extract all text from this document. Maintain the structure as much as possible. Only return the extracted text.",
    ]);
    return result.response.text();
  } catch (err) {
    console.error(`Gemini extraction failed for ${mimeType}:`, err);
    return null;
  }
};

export const extractTextFromPDF = async (fileBuffer) => {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Invalid or empty file buffer provided.");
    }

    let data;
    try {
      data = await pdf(fileBuffer);
    } catch (err) {
      console.warn("pdf-parse failed, falling back to Gemini OCR", err);
    }

    if (data?.text?.trim() && data.text.length > 50) {
      return data.text.trim();
    }
    
    console.log("PDF appears to be scanned or text extraction failed. Using Gemini Multimodal OCR...");
    
    // Fallback to Gemini Multimodal
    const geminiText = await extractTextWithGemini(fileBuffer, "application/pdf");
    if (geminiText) return geminiText;

    // Last resort fallback (Tesseract) would require splitting images, 
    // but since Gemini supports PDF directly we should rely on it.
    throw new Error("Gemini OCR failed to extract text from PDF.");
  } catch (error) {
    console.error("Error extracting text from PDF:", error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

export const extractTextFromDoc = async (fileBuffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value.trim(); // Raw text content
  } catch (error) {
    console.error("Error extracting text from DOC/DOCX file:", error.message);
    throw new Error("Failed to extract text from DOC/DOCX file.");
  }
};

// Extract text from Excel files

export const extractTextFromExcel = (fileBuffer) => {
  try {
    const sheets = xlsx.parse(fileBuffer); // Parse the buffer for .xls/.xlsx
    let extractedText = "";

    sheets.forEach((sheet) => {
      extractedText += `Sheet: ${sheet.name}\n`;

      sheet.data.forEach((row) => {
        extractedText += row.join(", ") + "\n";
      });

      extractedText += "\n";
    });

    return extractedText.trim();
  } catch (error) {
    console.error("Error extracting text from Excel file:", error.message);
    throw new Error("Failed to extract text from Excel file.");
  }
};

// Helper Function: Convert Buffer to Readable Stream
const fileBufferToStream = (buffer) => {
  const stream = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return stream;
};

// Extract text from CSV files
export const extractTextFromCSV = async (fileBuffer) => {
  const extractedText = [];
  const readableStream = fileBufferToStream(fileBuffer);

  return new Promise((resolve, reject) => {
    readableStream
      .pipe(csvParser())
      .on("data", (row) => {
        extractedText.push(Object.values(row).join(", "));
      })
      .on("end", () => {
        resolve(extractedText.join("\n"));
      })
      .on("error", (error) => {
        console.error("Error extracting text from CSV file:", error.message);
        reject(new Error("Failed to extract text from CSV file."));
      });
  });
};

// Convert PDF pages to images using pdf-poppler
// const convertPDFToImages = async (pdfPath) => {
//     const options = {
//       format: "jpeg",
//       out_dir: TEMP_DIR,
//       out_prefix: "page",
//       scale: 1024, // Adjust resolution
//     };

//     try {
//       await poppler.convert(pdfPath, options);
//       console.log("PDF successfully converted to images.");

//       const waitForImages = async () => {
//         for (let i = 0; i < 20; i++) { // Poll up to 20 times (adjust as needed)
//           const files = fs.readdirSync(TEMP_DIR);
//           console.log(`Polling attempt ${i + 1}:`, files); // Log TEMP_DIR content
//           const imageFiles = files.filter(
//             (file) => file.endsWith(".jpeg") || file.endsWith(".jpg") // Handle both extensions
//           );
//           if (imageFiles.length > 0) {
//             return imageFiles.map((file) => path.join(TEMP_DIR, file));
//           }
//           await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
//         }
//         throw new Error("Images did not appear in TEMP_DIR in time.");
//       };

//       return await waitForImages();
//     } catch (error) {
//       console.error("Error during PDF to image conversion:", error.message);
//       throw new Error("Failed to convert PDF to images.");
//     }
//   };
// Convert PDF pages to images using node-poppler
// Gemini handles PDFs directly, so we don't need poppler anymore
export const extractTextFromImage = async (fileBuffer, mimeType = "image/png") => {
  try {
    // Try Gemini first
    let text = await extractTextWithGemini(fileBuffer, mimeType);
    
    if (!text) {
      console.log("Gemini OCR failed for image, falling back to Tesseract");
      const result = await Tesseract.recognize(fileBuffer, "eng");
      text = result.data.text;
    }
    
    return text.trim();
  } catch (error) {
    console.error("Error extracting text from Image:", error.message);
    throw new Error("Failed to extract text from Image.");
  }
};
