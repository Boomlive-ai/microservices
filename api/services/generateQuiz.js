const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* 🧹 Scrape article text and metadata */
const scrapeArticleData = async (url) => {
    const html = (await axios.get(url)).data;
    const $ = load(html);

    const articleText =
        $("article p").map((_, el) => $(el).text()).get().join("\n") ||
        $("p").map((_, el) => $(el).text()).get().join("\n");

    const meta = {
        title: $('meta[property="og:title"]').attr("content") || "",
        description: $('meta[name="description"]').attr("content") || "",
        author: $('meta[name="author"]').attr("content") || "",
        published: $('meta[property="article:published_time"]').attr("content") || "",
    };

    return { articleText, meta };
};

/* ✨ Generate quiz using OpenAI and structured prompt */
const generateQuizFromData = async (articleText, meta) => {
    const prompt = `
Craft an engaging and interactive multiple-choice quiz based on the article and metadata below.

🔹 Generate max 5 questions as needed to capture the depth and nuance of the content —  restrict to a 5 questions only strictly.
🔹 Spark curiosity, challenge assumptions, and include playful phrasing when appropriate.
🔹 Avoid dry factual recall — make it fun and rewarding for the user to think through each question.
🔹 Remove option prefixes (no "A.", "B.", etc.) — return clean text.
🔹 In the "answer" field, include the full correct option text.
🔹 Make sure the options sequence is randomized for each quiz generation.
🔹 Format the response strictly as valid JSON.
Output Format:
{
  "quiz": [
    {
      "question": "string",
      "options": ["option text 1", "option text 2", "option text 3", "option text 4"],
      "answer": "index of correct answer from options array",
      "explanation": "Explanation for answer"
    },
    ...
  ]
}

Article: ${articleText}
Metadata: ${JSON.stringify(meta)}
`;


    const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
    });

    const cleaned = response.choices[0].message.content.trim().replace(/```json\n?|\n?```/g, "");
    return JSON.parse(cleaned);
};

/* 🚀 Express handler function */
const exportQuiz = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
        const { articleText, meta } = await scrapeArticleData(url);
        const quiz = await generateQuizFromData(articleText, meta);
        res.status(200).json({ quiz });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { exportQuiz };
