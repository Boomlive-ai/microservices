const { OpenAI } = require("openai"); // Import OpenAI

require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});


// const generateIntentForArticle = async (articleContent) => {
//     console.log("Analyzing intent for this content: ", articleContent);
//     try {
//         const prompt = `
// Analyze the provided article content for the presence of the following intents. Use the definitions to guide your analysis:

// 1. **Smear Campaign**: Efforts to harm someone's reputation through false or exaggerated claims.
// 2. **Demographic Anxiety**: Content that instills fear or resentment towards specific demographic groups.
// 3. **Sensationalism**: Exaggerated content designed to shock or attract attention.
// 4. **Fraud/Scam**: Deceptive information meant to manipulate individuals.
// 5. **Influence Operations**: Misleading information aimed at manipulating public opinion or destabilizing.

// Return a JSON object containing:

// - An "Intent" array with identified intents.
// - An "Explanation" object with detailed explanations for each intent, structured as follows:

// {
//   "Intent": ["Sensationalism", "Smear Campaign"],
//   "Explanation": {
//     "Sensationalism": "The article contains exaggerated claims to provoke reactions.",
//     "Smear Campaign": "It targets a specific individual with misleading claims."
//   }
// }

// Content: ${articleContent}
// `;

//         const response = await openai.chat.completions.create({
//             model: "gpt-4o", //gpt-3.5-turbo-16k
//             messages: [
//                 {
//                     role: "system",
//                     content: "You are a fact-checking assistant tasked with analyzing article content for misleading intents. Provide detailed explanations for each detected intent."
//                 },
//                 {
//                     role: "user",
//                     content: prompt,
//                 }
//             ],
//             max_tokens: 4096,
//             temperature: 0.3,
//         });

//         const responseText = response.choices[0].message.content.trim();
//         console.log(responseText);
//         const cleanedText = responseText.replace(/```json\n|\n```/g, "");
//         // Parse and return the JSON output from the response
//         return JSON.parse(cleanedText);
//     } catch (error) {
//         console.error("Error analyzing intent:", error);
//         return null;
//     }
// };

const generateIntentForArticle = async (articleContent) => {
  console.log("Analyzing intent for this content: ", articleContent);
  try {
      const prompt = `
Analyze the provided article content for the presence of the following intents. Use the definitions to guide your analysis:

1. **Smear Campaign**: A coordinated effort to damage the reputation or credibility of an individual, group, or organization by spreading false, misleading, or exaggerated information. These claims typically aim to discredit a target through defamatory content, which may be personal, ideological, or politically motivated.
2. **Demographic Anxiety**: Information spread to evoke fear or resentment toward particular demographic groups, often motivated by a perception that certain communities pose a threat to cultural, economic, or political stability. These messages exploit societal fears about changes in population composition or social dominance.
3. **Sensationalism**: Exaggerated or fabricated content designed to attract attention, provoke shock, or entertain, without necessarily intending harm to a specific group or individual. This type is often aimed at maximizing engagement or views, appealing to audiences' curiosity or emotions.
4. **Fraud/Scam**: False or deceptive information crafted to manipulate individuals into taking actions that benefit the perpetrator, often resulting in financial or personal losses for the victim. This category includes fake offers, impersonations, phishing schemes, or deceptive claims designed to gain sensitive information, money, or access to resources from the target.
5. **Influence Operations**: Misleading content intentionally deployed by foreign or domestic actors to manipulate public opinion, shape perceptions, or destabilize socio-political landscapes in target countries. Such messages often appeal to divisive societal issues, aiming to influence opinions or erode trust in institutions.

Return a JSON object containing:

- An "Intent" array with identified intents.
- An "Explanation" object with detailed explanations for each intent, structured as follows:

{
"Intent": ["Sensationalism", "Smear Campaign"],
"Explanation": {
  "Sensationalism": "The article contains exaggerated claims to provoke reactions.",
  "Smear Campaign": "It targets a specific individual with misleading claims."
}
}

Content: ${articleContent}
`;

      const response = await openai.chat.completions.create({
          model: "gpt-4o", //gpt-3.5-turbo-16k
          messages: [
              {
                  role: "system",
                  content: "You are a fact-checking assistant tasked with analyzing article content for misleading intents. Provide detailed explanations for each detected intent."
              },
              {
                  role: "user",
                  content: prompt,
              }
          ],
          max_tokens: 4096,
          temperature: 0.3,
      });

      const responseText = response.choices[0].message.content.trim();
      console.log(responseText);
      const cleanedText = responseText.replace(/```json\n|\n```/g, "");
      // Parse and return the JSON output from the response
      return JSON.parse(cleanedText);
  } catch (error) {
      console.error("Error analyzing intent:", error);
      return null;
  }
};

const analyzeIntent = async (req, res) => {
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
        // articleText = await fetchArticleContent(url);
      }
  

      res.status(200).json({  }); // Send back the sentiment analysis
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  


  module.exports = {
    generateIntentForArticle
  };