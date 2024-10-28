
const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai"); // Import OpenAI
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importing the Google Generative AI library

require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Initialize the client with your API key

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
    // console.log(articleText);

    return articleText.trim();
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("Error fetching article content");
  }
};

const summarizeArticle = async (articleText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Specify the model you want to use
    const prompt = `Summarize the following article:\n\n${articleText}`; // Prepare your prompt

    const result = await model.generateContent([prompt]); // Call the method to generate content
    const summary = result.response.text(); // Get the generated summary text
    return summary;
  } catch (error) {
    console.error("Error summarizing article:", error);
    throw new Error("Error summarizing article");
  }
};
// Implement the checkSourceReliability function

const checkSourceReliability = async (articleText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on the following article content, evaluate the reliability of the source. Article content: ${articleText}`;

    const result = await model.generateContent([prompt]);
    const reliability = result.response.text();
    return reliability;
  } catch (error) {
    console.error("Error assessing source reliability:", error);
    return "Unable to assess reliability";
  }
};


const analyzeSentiment = async (articleText) => {
  try {



    const boomAnalysisText = await extractBoomAnalysis(articleText);

    if (!boomAnalysisText) {
      throw new Error("No BOOM analysis found in the article.");
    }



    const combinedPrompt = `Analyse the claim section in article and filter the original content from boom analysis it shouldnt consider any analysis performed by noom and analyze the following article from a user’s perspective, focusing exclusively on the claims made by the original sources cited within the article. Exclude any fact-check sections and do not consider the BOOM article itself as a source or target. Pay particular attention to the claims made by other organizations or posts on platforms such as Instagram, Twitter, Facebook, and YouTube mentioned within the claim section. Provide results in a structured JSON format.
Article content: ${boomAnalysisText}.
Return the results in this JSON format and note if source of claim has same entity as targets it shouldn't add them as targets:
{
  "target": {
    "individuals": ["Name1", "Name n" or null], 
    "organizations": [null if value of sourceofclaim is similar  or "Only those who are not considered as sourceofclaims"],
    "communities": ["Community1", "Community n" or null]
  },
  
  "sourceofclaim": "**list all the sources who made the false claims or spread several misinformation(Eg:News Media, Organizations, Indivial, Social Media Posts)**",
  
  "sentiment": {
    "classification": "Positive/Negative/Neutral",
    "justification": "One Line Justification for the sentiment"
  },
  
  "topic": "Your concise title.",
  "themes": ["Theme1", "Theme2"], // Eg:- (politics, communal, sports, entertainment, international, religious)
  "location": "City, Region, Country" 
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o or gpt-4o
      messages: [
        {
          role: "system",
          content:
            "You are an analyst focusing on user perspectives. Focus mainly on the claims made by original sources cited in the article, excluding BOOM's own claims and fact-checking conclusions. Provide concise results in JSON format.",
        },
        { role: "user", content: combinedPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.4,
    });

    const responseText = response.choices[0].message.content.trim();
    // console.log(responseText);

    const cleanedText = responseText.replace(/```json\n|\n```/g, "");
    results = JSON.parse(cleanedText);
console.log(results);

    return results;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return null;
  }
};

const extractBoomAnalysis = async (articleText) => {
  try {
    // Prompt to instruct the model to extract only BOOM's analysis sections
    const prompt = `From the article below, extract only the sections where BOOM provides its analysis or explanations of the claims. Do not include any parts that are purely quotes from the original claim or statements. Focus only on BOOM's fact-checking and explanations.
    
    Article content: ${articleText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // You can use gpt-4 if needed
      messages: [
        {
          role: "system",
          content:
            "You are a fact-checking assistant. Your job is to extract only the sections where BOOM has provided analysis or explanations of claims.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const responseText = response.choices[0].message.content.trim();
    console.log("Extracted BOOM Analysis:", responseText);

    // Return the extracted BOOM analysis text
    return responseText;
  } catch (error) {
    console.error("Error extracting BOOM analysis:", error);
    return null;
  }
};

const extractSentimentFromNews = async (req, res) => {
  const { url, text } = req.body;

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
    console.log(
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4"
    );

    console.log(articleText);
    console.log(
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4"
    );

    const sentiment = await analyzeSentiment(articleText);

    res.status(200).json({ sentiment }); // Send back the sentiment analysis
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const summarizeNews = async (req, res) => {
  const { url, text } = req.body; // Expecting URL and text in the request body

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

    const reliability = await checkSourceReliability(articleText);

    // Summarize the article text using the Google Generative AI
    const summary = await summarizeArticle(articleText);
    res.status(200).json({ summary, reliability }); // Send back the sentiment analysis
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  summarizeNews,
  extractSentimentFromNews,
};