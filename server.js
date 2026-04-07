require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3999;

app.use(bodyParser.json());
app.use(cors());

console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });

    const sapContext = `
You are SAP SD Buddy.
Answer only SAP SD related questions.
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: sapContext + "\n\n" + question }
          ]
        }
      ]
    });

    const answer =
      result.response.candidates[0].content.parts[0].text;

    res.json({ answer });

  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "Failed to get response" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
