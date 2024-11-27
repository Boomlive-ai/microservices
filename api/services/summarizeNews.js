const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai"); // Import OpenAI

require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey:  process.env.OPENAI_API_KEY, // Use the API key from the .env file
});


const fetchArticleContent = async (url) => {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = load(htmlContent);
    let articleText = "";

    $("article p").each((index, element) => {
      articleText += $(element).text() + "\n";
    });

    if (!articleText) {
      $("p").each((index, element) => {
        articleText += $(element).text() + "\n";
      });
    }
    console.log(articleText);
    
    return articleText.trim();
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("Error fetching article content");
  }
};

const summarizeArticle = async (articleText, responseLimit) => {
  try {

    console.log(responseLimit);
    
    const prompt = `
Summarize the following article in bullet points in a array. The summary should capture the main points and key details in a concise format in ${responseLimit} lines only:
Article: ${articleText}
Strictly provide response in json format:

    Eg: {
          "summary": ["summary point 1", "summary point 2",.....,"summary point n"]
        }
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or use "gpt-3.5-turbo" for a faster, cost-effective option
      messages: [
        {
          role: "system",
          content: "You are a summarization assistant that creates concise summaries of provided articles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4096, // Adjust based on desired summary length
      temperature: 0, // Set to 0 for a more deterministic response
    });

    const responseText = response.choices[0].message.content.trim();
    const cleanedText = responseText.replace(/```json\n|\n```/g, "");

    console.log(cleanedText);
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error summarizing article:", error);
    throw new Error("Error summarizing article");
  }
};

// Implement the checkSourceReliability function




const summarizeNews = async (req, res) => {
  const { url, text,  responseLimit} = req.body; // Expecting URL and text in the request body
  
  // Check if both URL and text are empty
  if (!url && !text) {
    return res.status(400).json({ error: "Either URL or text is required" });
  }

  try {
    let articleText;

    // If text is provided, use it directly
    if (text) {
      articleText = text;
    }
    // If URL is provided, fetch the article content
    else if (url) {
      articleText = await fetchArticleContent(url);
    }
    // Summarize the article text using the Google Generative AI
    const summary = await summarizeArticle(articleText, responseLimit);

    console.log(summary);
    
    res.status(200).json({ response: summary }); // Send back the sentiment analysis
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  summarizeNews
};
