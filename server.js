require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3999;

console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

app.use(bodyParser.json());
app.use(cors());

const indexPath = path.join(__dirname, "index.html");

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(indexPath);
});

// Health route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const sapContext = `
You are SAP SD Buddy, an expert in SAP Sales & Distribution.
Only answer questions in the context of SAP SD.
If outside SAP SD, say: I can only help with SAP SD related topics.
`;

    const result = await model.generateContent(
      sapContext + "\n\nUser question: " + question
    );

    const answer =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer generated";

    res.json({ answer });

  } catch (error) {
    console.error("❌ Gemini error:", error);
    res.status(500).json({
      error: "Gemini request failed",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
