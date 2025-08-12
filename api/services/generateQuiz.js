// const axios = require("axios");
// const { load } = require("cheerio");
// const { OpenAI } = require("openai");
// require("dotenv").config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// /* 🧹 Scrape article text and metadata */
// const scrapeArticleData = async (url) => {
//     const html = (await axios.get(url)).data;
//     const $ = load(html);

//     const articleText =
//         $("article p").map((_, el) => $(el).text()).get().join("\n") ||
//         $("p").map((_, el) => $(el).text()).get().join("\n");

//     const meta = {
//         title: $('meta[property="og:title"]').attr("content") || "",
//         description: $('meta[name="description"]').attr("content") || "",
//         author: $('meta[name="author"]').attr("content") || "",
//         published: $('meta[property="article:published_time"]').attr("content") || "",
//     };

//     return { articleText, meta };
// };

// /* ✨ Generate quiz using OpenAI and structured prompt */
// const generateQuizFromData = async (articleText, meta) => {
//     const prompt = `
// Craft an engaging and interactive multiple-choice quiz based on the article and metadata below.

// 🔹 Generate max 5 questions as needed to capture the depth and nuance of the content —  restrict to a 5 questions only strictly.
// 🔹 Spark curiosity, challenge assumptions, and include playful phrasing when appropriate.
// 🔹 Avoid dry factual recall — make it fun and rewarding for the user to think through each question.
// 🔹 Remove option prefixes (no "A.", "B.", etc.) — return clean text.
// 🔹 In the "answer" field, include the full correct option text.
// 🔹 Make sure the options sequence is randomized for each quiz generation.
// 🔹 Format the response strictly as valid JSON.
// Output Format:
// {
//   "quiz": [
//     {
//       "question": "string",
//       "options": ["option text 1", "option text 2", "option text 3", "option text 4"],
//       "answer": "index of correct answer from options array",
//       "explanation": "Explanation for answer"
//     },
//     ...
//   ]
// }

// Article: ${articleText}
// Metadata: ${JSON.stringify(meta)}
// `;


//     const response = await openai.chat.completions.create({
//         model: "gpt-4.1-mini",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.5,
//     });

//     const cleaned = response.choices[0].message.content.trim().replace(/```json\n?|\n?```/g, "");
//     return JSON.parse(cleaned);
// };

// /* 🚀 Express handler function */
// const exportQuiz = async (req, res) => {
//     const { url } = req.body;
//     if (!url) return res.status(400).json({ error: "URL is required" });

//     try {
//         const { articleText, meta } = await scrapeArticleData(url);
//         const quiz = await generateQuizFromData(articleText, meta);
//         res.status(200).json({ quiz });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = { exportQuiz };



const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* 🌐 Language configuration */
const languageConfig = {
    en: {
        name: "English",
        instruction: "in English"
    },
    hi: {
        name: "Hindi",
        instruction: "in conversational, everyday Hindi (हिंदी में), avoiding overly formal or Sanskritized words. Use natural expressions — for example, prefer 'इसका मतलब क्या है?' instead of 'इसका अहम क्या है?'. Keep tone friendly and relatable."
    },
    bn: {
        name: "Bengali",
        instruction: "in conversational, everyday Bengali (বাংলায়), avoiding overly formal or literary শুদ্ধ বাংলা unless needed. Use natural expressions — for example, prefer 'এর মানে কী?' instead of overly formal phrases. Keep tone friendly and relatable."
    },
    es: { name: "Spanish", instruction: "in Spanish (en español)" },
    fr: { name: "French", instruction: "in French (en français)" },
    // Add more languages as needed
};

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
const quizFunctionSchema = {
    name: "generateQuiz",
    description: "Generate a structured multiple-choice quiz from article content",
    parameters: {
        type: "object",
        properties: {
            quiz: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string", description: "The quiz question" },
                        options: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 4,
                            maxItems: 4,
                            description: "List of 4 answer options"
                        },
                        answer: {
                            type: "integer",
                            minimum: 0,
                            maximum: 3,
                            description: "Index of the correct option"
                        },
                        explanation: { type: "string", description: "Explanation for the correct answer" }
                    },
                    required: ["question", "options", "answer", "explanation"]
                }
            }
        },
        required: ["quiz"]
    }
};
/* ✨ Generate quiz using OpenAI with language support */
// const generateQuizFromData = async (articleText, meta, lang = "en") => {
//     const languageInfo = languageConfig[lang] || languageConfig["en"];
//     const languageInstruction = languageInfo.instruction;

//     const prompt = `
// Craft an engaging and interactive multiple-choice quiz based on the article and metadata below.

// 🌐 IMPORTANT: Generate all content ${languageInstruction}. All questions, options, answers, and explanations must be ${languageInstruction}.

// 🔹 Generate max 5 questions as needed to capture the depth and nuance of the content — restrict to 5 questions only strictly.
// 🔹 Spark curiosity, challenge assumptions, and include playful phrasing when appropriate.
// 🔹 Avoid dry factual recall — make it fun and rewarding for the user to think through each question.
// 🔹 Remove option prefixes (no "A.", "B.", etc.) — return clean text.
// 🔹 In the "answer" field, include the index (0-3) of the correct option.
// 🔹 Make sure the options sequence is randomized for each quiz generation.
// 🔹 Format the response strictly as valid JSON.
// 🔹 All text content including questions, options, and explanations should be ${languageInstruction}.

// Output Format:
// {
//   "quiz": [
//     {
//       "question": "string",
//       "options": ["option text 1", "option text 2", "option text 3", "option text 4"],
//       "answer": "index of correct answer from options array",
//       "explanation": "Explanation for answer"
//     },
//     ...
//   ]
// }

// Article: ${articleText}
// Metadata: ${JSON.stringify(meta)}
// `;

//     const response = await openai.chat.completions.create({
//         model: "gpt-4.1-mini",
//         messages: [{ role: "user", content: prompt }],
//         functions: [quizFunctionSchema],
//         function_call: { name: "generateQuiz" },
//         temperature: 0.5,
//     });
//     console.log(response.choices[0].message.content)
//     const cleaned = response.choices[0].message.content.trim().replace(/``````/g, "");
//     return JSON.parse(cleaned);
// };
const generateQuizFromData = async (articleText, meta, lang = "en") => {
    const languageInfo = languageConfig[lang] || languageConfig["en"];
    const languageInstruction = languageInfo.instruction;

    const prompt = `
Craft an engaging and interactive multiple-choice quiz based on the article and metadata below.

🌐 IMPORTANT: Generate all content ${languageInstruction}. All questions, options, answers, and explanations must be ${languageInstruction}.

🔹 Generate max 5 questions as needed to capture the depth and nuance of the content — restrict to 5 questions only strictly.
🔹 Spark curiosity, challenge assumptions, and include playful phrasing when appropriate.
🔹 Avoid dry factual recall — make it fun and rewarding for the user to think through each question.
🔹 Remove option prefixes (no "A.", "B.", etc.) — return clean text.
🔹 In the "answer" field, include the index (0-3) of the correct option.
🔹 Make sure the options sequence is randomized for each quiz generation.
🔹 Format the response strictly as valid JSON.
🔹 All text content including questions, options, and explanations should be ${languageInstruction}.

Article: ${articleText}
Metadata: ${JSON.stringify(meta)}
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        functions: [quizFunctionSchema],
        function_call: { name: "generateQuiz" },
        temperature: 0.5,
        max_tokens: 3000
    });

    const args = response.choices[0].message.function_call?.arguments;

    if (!args) {
        throw new Error("No function_call arguments returned from OpenAI");
    }

    const parsed = JSON.parse(args);
    return parsed;
};

/* 🚀 Express handler function with language support */
const exportQuiz = async (req, res) => {
    const { url, lang = "en" } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    // Validate language parameter
    if (!languageConfig[lang]) {
        return res.status(400).json({
            error: `Unsupported language: ${lang}. Supported languages: ${Object.keys(languageConfig).join(", ")}`
        });
    }

    try {
        const { articleText, meta } = await scrapeArticleData(url);
        const quiz = await generateQuizFromData(articleText, meta, lang);

        res.status(200).json({
            quiz,
            language: languageConfig[lang].name,
            langCode: lang
        });
    } catch (error) {
        console.error("Quiz generation error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { exportQuiz };

