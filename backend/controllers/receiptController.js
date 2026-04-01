const Receipt = require("../models/Receipt");
const IncomeExpense = require("../models/IncomeExpense");
const fs = require("fs");
const Tesseract = require("tesseract.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini API key set:", !!process.env.GEMINI_API_KEY);

// ✅ Helper function: convert uploaded file to inlineData format
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType,
    },
  };
}

// @desc    Upload a receipt and extract data using Gemini
// @route   POST /api/receipts/upload
// @access  Private
const uploadReceipt = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }

  try {
    console.log("=== RECEIPT UPLOAD DEBUG ===");
    console.log("File received:", req.file);

    let extractedData = {};

    // --- GEMINI EXTRACTION ---
    try {
      const prompt = `
        Analyze this receipt image and extract:
        - merchant: name of store
        - amount: total amount paid
        - currency: ISO code of currency, e.g. "INR", "USD", "EUR"
        - date: transaction date (YYYY-MM-DD)
        - category: one from [Groceries, Food, Shopping, Bills, Transportation, Entertainment]

        Return result as compact JSON, e.g.:
        {"merchant":"Reliance Fresh","amount":124.50,currency":"INR","date":"2025-10-22","category":"Groceries"}

      `;

      const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);

      // ✅ use new Gemini SDK syntax
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent([prompt, imagePart]);
      const raw = result.response.text();

      console.log("Gemini raw output:", raw);

      // Clean and parse JSON
      const cleanedText = raw
        .replace(/^[\s`]*```json[\s`]*/i, "")
        .replace(/[\s`]*```$/i, "")
        .trim();

      try {
        extractedData = JSON.parse(cleanedText);

        // Normalize amount
        if (typeof extractedData.amount !== "number") {
          const num = Number(
            String(extractedData.amount ?? "").replace(/[^0-9.]/g, "")
          );
          if (!Number.isNaN(num)) extractedData.amount = num;
        }

        // Normalize date
        if (extractedData.date) {
          const d = new Date(extractedData.date);
          if (!Number.isNaN(d.getTime())) {
            extractedData.date = d.toISOString().slice(0, 10);
          }
        }

        console.log("Normalized data:", extractedData);
      } catch (err) {
        console.warn("[Gemini] JSON parse failed:", err.message);
        console.warn("Raw text:", cleanedText);
      }
    } catch (geminiError) {
      console.warn("Gemini API error (fallback to OCR):", geminiError.message);
    }

    // --- OCR FALLBACK if Gemini fails to detect ---
    if (!extractedData.amount || Number(extractedData.amount) === 0) {
      try {
        const ocr = await Tesseract.recognize(req.file.path, "eng");
        const text = ocr.data?.text || "";
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        const preferredPatterns = [
          /total\s*amount/i,
          /cash\s*received/i,
          /amount\s*paid/i,
        ];
        const ignorePatterns = [
          /subtotal/i,
          /service/i,
          /rounding/i,
          /qty/i,
          /bill\s*no/i,
        ];

        const extractNumbers = (s) =>
          (s.match(/\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+\.\d{1,2}|\d+/g) || [])
            .map((n) => Number(n.replace(/,/g, "")))
            .filter((n) => Number.isFinite(n) && n > 0 && n < 1_000_000);

        const candidates = [];

        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i];
          if (ignorePatterns.some((p) => p.test(line))) continue;
          if (preferredPatterns.some((p) => p.test(line))) {
            const nums = extractNumbers(line);
            if (nums.length) {
              candidates.push(nums[nums.length - 1]);
              break;
            }
          }
        }

        if (candidates.length === 0) {
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            if (ignorePatterns.some((p) => p.test(line))) continue;
            if (/total/i.test(line)) {
              const nums = extractNumbers(line);
              if (nums.length) {
                candidates.push(nums[nums.length - 1]);
                break;
              }
            }
          }
        }

        if (candidates.length === 0) {
          for (
            let i = lines.length - 1;
            i >= Math.max(0, lines.length - 12);
            i--
          ) {
            const nums = extractNumbers(lines[i]);
            if (nums.length) {
              candidates.push(nums[nums.length - 1]);
              break;
            }
          }
        }

        if (candidates.length) {
          const best = Math.max(...candidates);
          if (best && Number.isFinite(best)) extractedData.amount = best;
        }

        if (!extractedData.merchant && /irctc/i.test(text)) {
          extractedData.merchant = "IRCTC";
        }
        if (!extractedData.category && /(tea|food|invoice|canteen)/i.test(text)) {
          extractedData.category = "Food";
        }
      } catch (ocrError) {
        console.warn("Tesseract fallback failed:", ocrError.message);
      }
    }

    // --- SAVE RECEIPT & CREATE TRANSACTION ---
    const newReceipt = new Receipt({
      user: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      extractedData: {
        amount: extractedData.amount || 0,
        category: extractedData.category || "Miscellaneous",
        date: extractedData.date ? new Date(extractedData.date) : new Date(),
        merchant: extractedData.merchant || "Unknown Merchant",
      },
    });

    const savedReceipt = await newReceipt.save();

    if (savedReceipt) {
      const newTransaction = new IncomeExpense({
        user: req.user.id,
        name: savedReceipt.extractedData.merchant,
        category: savedReceipt.extractedData.category,
        cost: savedReceipt.extractedData.amount,
        addedOn: savedReceipt.extractedData.date,
        isIncome: false,
      });
      await newTransaction.save();
    }

    res.status(201).json(savedReceipt);
  } catch (error) {
    console.error("Error uploading receipt:", error);
    res.status(500).json({
      message: "Failed to upload receipt",
      error: error.message,
    });
  }
};

module.exports = { uploadReceipt };
