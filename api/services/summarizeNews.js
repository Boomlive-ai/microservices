const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai"); // Import OpenAI
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importing the Google Generative AI library

require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey:  process.env.OPENAI_API_KEY, // Use the API key from the .env file
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
    console.log(articleText);
    
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

  const prompts = {
    Target: `Provide the name who is being targeted by the claim and describe the target as an individual, group, organization, or entity, including relevant roles or affiliations, the response should be wrapped and phrased in one sentence (e.g., "Sudarshan News - Media Outlet, Narendra Modi - The Prime Minister") . Article content: ${articleText}`,
  
    // Sentiment: `As a Fact-checking expert analyst in a top-tier organisation analyze the sentiment conveyed by the claim. Classify it as Positive, Negative, or Neutral(is the claim targeting positively, negatively, or neutrally) reflecting an emphasis on the factual reporting  without emotional interpretation. Provide Justification for sentiment, considering nuances like sarcasm or mixed feelings, The response should be pharsed like: sentiment(Positive, Negative, or Neutral)- Justification, note the sentiment should be provided by approaching article as a fact-checking expert analyst in a top-tier organisation. Article content: ${articleText}`,
  

    Sentiment: `As a fact-checking expert analyst in a top-tier organization, evaluate the sentiment conveyed by the claim in the article. Classify the sentiment as Positive, Negative, or Neutral, focusing on the implications of the misinformation for affected communities. Your justification should highlight any emotional or social impact and it should be phrased in just one line, including potential harm caused by the false claims. Phrase your response as follows: (Positive, Negative, or Neutral) - Justification(one liner justification). Article content: ${articleText}`,



    Topic: `As a Fact-checking expert analyst in a top-tier give a topic tile to understand the context of article in few words.The Response should be a title like sentence which gives idea of topic of article. Article content: ${articleText}`,
  
    Theme: `As a Fact-checking expert analyst in a top-tier organisation identify the primary theme(s) related to the claim from the categories (politics, communal, sports, entertainment, international, religious). , The Response should be single word like (politics, communal, sports, entertainment, international, religious), note if article has two or more themese then show it using seperated comma","(for eg. communal, politcal). Article content: ${articleText}`,
  
    Location: `Identify the specific location(s) relevant to the false claim (city, region, country), the response should be like (city, region, country) (eg, Mumbai, Maharashtra) . Article content: ${articleText}`,
  
    // // Optional additional prompts
    // ClaimType: `Classify the false claim as Misleading, Fabricated, Manipulated Media, or Other (specify). Article content: ${articleText}`,
  
    // Evidence: `Evaluate the credibility and reliability of evidence presented in the article to support or refute the claim. Article content: ${articleText}`,
  
    // PotentialImpact: `Assess the potential consequences of the false claim on public opinion, policy, or social discourse. Article content: ${articleText}`,
  };
    const results = {};

    for (const [key, prompt] of Object.entries(prompts)) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // or "gpt-4" if needed
        messages: [
          {
            role: "system",
            content: "You are a top-tier analyst from a world-renowned news organization like the New York Times. Your expertise in analyzing and fact-checking news is unmatched. Ensure that all personal details are accurate and fact-checked, and do not assume or infer information not explicitly mentioned in the article. Focus on providing concise, accurate analysis in 1-2 lines.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 40, // Reduce token limit for tighter control
      });

      const responseText = response.choices[0].message.content.trim();
      results[key] = responseText.toLowerCase() === "null"
        ? null
        : responseText.replace(/\*\*/g, "").trim();
    }

    return results; // Return the structured JSON
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return null; // Handle error gracefully
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
  extractSentimentFromNews
};
