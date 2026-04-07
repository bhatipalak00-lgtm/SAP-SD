require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3999;

app.use(bodyParser.json());
app.use(cors());

console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const prompt = `
You are SAP SD Buddy, expert in SAP SD.
Only answer SAP SD related questions.

Question: ${question}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      }
    );

    const answer =
      response.data.candidates[0].content.parts[0].text;

    res.json({ answer });

  } catch (error) {
    console.error("Gemini error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get response" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
