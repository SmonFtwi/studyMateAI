import pdf from "pdf-parse";
//import poppler from "pdf-poppler";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { Poppler } from "node-poppler";
import xlsx from "node-xlsx";

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

export const extractTextFromPDF = async (fileBuffer) => {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Invalid or empty file buffer provided.");
    }

    // Step 1: Try extracting text using pdf-parse
    const data = await pdf(fileBuffer);
    if (data.text.trim()) {
      return data.text.trim();
    } else {
      console.log("PDF appears to be scanned. Converting to images for OCR...");
    }

    // Step 2: Write PDF buffer to a temporary file
    const pdfPath = path.join(TEMP_DIR, "uploaded.pdf");
    fs.writeFileSync(pdfPath, fileBuffer);

    // Step 3: Convert PDF pages to images
    const imagePaths = await convertPDFToImages(pdfPath);
    //console.log("Generated image paths:", imagePaths);

    // Step 4: Perform OCR on each image
    let extractedText = "";
    for (const imagePath of imagePaths) {
      //console.log(`Performing OCR on image: ${imagePath}`);
      const ocrResult = await Tesseract.recognize(imagePath, "eng", {
        //logger: (info) => console.log(info), // Optional: Log OCR progress
      });
      extractedText += `${ocrResult.data.text}\n`;

      // Clean up temporary image
      fs.unlinkSync(imagePath);
    }

    // Clean up temporary PDF
    fs.unlinkSync(pdfPath);

    //console.log("Extracted text:", extractedText.trim());

    return extractedText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error.message);
    throw new Error("Failed to extract text from PDF.");
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
const convertPDFToImages = async (pdfPath) => {
  const poppler = new Poppler();
  const options = {
    pngFile: true, // Output images in PNG format
    singleFile: false, // Generate separate files for each page
  };

  try {
    // Convert PDF to images
    await poppler.pdfToCairo(pdfPath, path.join(TEMP_DIR, "page"), options);
    console.log("PDF successfully converted to images.");

    // Retrieve generated image paths
    const imageFiles = fs
      .readdirSync(TEMP_DIR)
      .filter((file) => file.endsWith(".png"));
    if (imageFiles.length === 0) {
      throw new Error("No images were generated from the PDF.");
    }

    return imageFiles.map((file) => path.join(TEMP_DIR, file));
  } catch (error) {
    console.error("Error during PDF to image conversion:", error.message);
    throw new Error("Failed to convert PDF to images.");
  }
};
