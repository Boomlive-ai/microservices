// const axios = require("axios");
// const { load } = require("cheerio");
// const { OpenAI } = require("openai"); // Import OpenAI
// const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importing the Google Generative AI library

// require("dotenv").config();

// const openai = new OpenAI({
//   organization: process.env.OPENAI_ORG,
//   project: process.env.OPENAI_PROJECT,
//   apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
// });



// const analyzeIntent = async (req, res) => {
//     const { url, text } = req.body; // Expecting URL and text in the request body
  
//     // Check if both URL and text are empty
//     if (!url && !text) {
//       return res.status(400).json({ error: "Either URL or text is required" });
//     }
  
//     try {
//       let articleText;
  
//       // If text is provided, use it directly
//       if (text) {
//         articleText = text;
//       }
//       // If URL is provided, fetch the article content
//       else if (url) {
//         // articleText = await fetchArticleContent(url);
//       }
  

//       res.status(200).json({  }); // Send back the sentiment analysis
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  


//   module.exports = {
//     analyzeIntent,
//   };