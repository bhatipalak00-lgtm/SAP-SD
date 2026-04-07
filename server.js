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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const sapContext = `
You are SAP SD Buddy, expert in SAP SD.
Answer only SAP SD questions.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: sapContext + "\n" + question }]
        }
      ]
    });

    const answer =
      result.response.candidates[0].content.parts[0].text;

    res.json({ answer });

  } catch (error) {
    console.error("Gemini error:", error);

    // Handle quota error
    if (error.message?.includes("Quota")) {
      return res.json({
        answer: "⏳ Too many requests. Please wait a few seconds and try again."
      });
    }

    res.status(500).json({ error: "Failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
