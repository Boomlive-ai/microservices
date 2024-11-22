const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai"); // Import OpenAI
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importing the Google Generative AI library
const { generateIntentForArticle } = require("../services/analyzeIntent"); // Import the summarizeNews function

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

    const combinedPrompt = `Analyse the claim section in article and filter the original content from boom analysis it shouldnt consider any analysis performed by noom and analyze the following article from a target's perspective, focusing exclusively on the claims made by the original sources cited within the article. Exclude any fact-check sections and do not consider the BOOM article itself as a source or target. Pay particular attention to the claims made by other organizations or posts on platforms such as Instagram, Twitter, Facebook, and YouTube mentioned within the claim section. Provide results in a structured JSON format.
Article content: ${boomAnalysisText}.
Return the results in this JSON format and note if source of claim has same entity as targets it shouldn't add them as targets:
{
  "target": {
      "individuals": [
          {
              "name": "Name1",
              "sentiment": "positive/negative/neutral", // shouldn't consider negative only because it has some misinformation, it should see if that misinformation benefits or harms the individual target and should mark positive or negative respectively or neutral it doesnt affect and make it sure that llm model's randomness shouuld not change the sentiment next time.  
              "justification": "Explanation of why this sentiment is assigned, based on how the claim affects the individual."
          },
          {
              "name": "Name n",
              "sentiment": "positive/negative/neutral", // shouldn't consider sentiment as negative only because it has some misinformation, it should see and analyze if that misinformation benefits or harms the individual target and should mark positive or negative respectively or neutral it doesnt affect and make it sure that llm model's randomness shouuld not change the sentiment next time.  
              "justification": "Explanation of sentiment assignment from target perspective."
          }
          // Additional individuals as needed
      ] || null,  // Targets of the Original Claims and sentiment from the perspective of target and if the claim benefits even if it is misinformation the target it should be positive else if harms the target it should be negative and if it doesnt bother the target it should be neutral

      "organizations": [
          {
              "name": "Organization1",
              "sentiment": "positive/negative/neutral",  // shouldn't consider sentiment as negative only because it has some misinformation, it should see and analyze if that misinformation benefits or harms the organization target and should mark positive or negative respectively or neutral it doesnt affect and make it sure that llm model's randomness shouuld not change the sentiment next time.  
              "justification": "Explanation of why this sentiment is assigned, based on how the claim affects the organization."
          },
          {
              "name": "Organization n",
              "sentiment": "positive/negative/neutral", // shouldn't consider sentiment as negative only because it has some misinformation, it should see and analyze if that misinformation benefits or harms the organization target and should mark positive or negative respectively or neutral it doesnt affect and make it sure that llm model's randomness shouuld not change the sentiment next time.  
              "justification": "Explanation of sentiment assignment from target perspective."
          }
          // Additional organizations as needed
      ] || null, // Targets of the Original Claims and sentiment from the perspective of target and if the claim benefits even if it is misinformation the target it should be positive else if harms the target it should be negative and if it doesnt bother the target it should be neutral

      "communities": [
          {
              "name": "Community1",
              "sentiment": "positive/negative/neutral", // shouldn't consider sentiment as negative only because it has some misinformation, it should see and analyze if that misinformation benefits or harms the communitie target and should mark positive or negative respectively or neutral it doesnt affect and make it sure that llm model's randomness shouuld not change the sentiment next time.  
              "justification": "Explanation of why this sentiment is assigned, based on how the claim affects the community."
          },
          {
              "name": "Community n",
              "sentiment": "positive/negative/neutral", , // shouldn't consider sentiment as negative only because it has some misinformation, it should see and analyze if that misinformation benefits or harms the communitie target and should mark positive or negative respectively or neutral it doesnt affect and make it sure that **llm model's randomness in providing response shouuld not change the sentiment next time**.  
              "justification": "Explanation of sentiment assignment."
          }
          // Additional communities as needed
      ] || null, // Targets of the Original Claims and sentiment from the perspective of target and if the claim benefits even if it is misinformation the target it should be positive else if harms the target it should be negative and if it doesnt bother the target it should be neutral
  },

  "sourceofclaim": "**list all the orginal sources who made the claims or spread several misinformation and from where boom did the analysis**",
  
  "sentiment": {
    "classification": "Positive/Negative/Neutral", // Understand what overall targets sentiment. Provide the sentiment and consider sentiment as neutral if there's any confusion in overall anaysis like it shoulnt be baised to anyone and if one is negative and one is neutral the overall sentiment should be neutral
    "justification": "One Line Justification for the sentiment"
  },
  
  "topic": "Your concise title.",
  "themes": ["Theme1", "Theme2"], // Eg:- (politics, communal, sports, entertainment, international, religious)
  "location": "City, Region, Country" 
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o or gpt-4o // gpt-3.5-turbo
      messages: [
        {
          role: "system",
          content:
            "You are an analyst. Focus mainly on the claims made by original sources cited in the article, excluding BOOM's own claims and fact-checking conclusions. Provide concise results in JSON format.",
        },
        { role: "user", content: combinedPrompt },
      ],
      max_tokens: 1000,
      temperature: 0,
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

const analyzeSentiment2 = async (articleText, heading, url, publicationDate, claimReviewBlock) => {
  try {
    const boomAnalysisText = await extractBoomAnalysis(articleText);

    if (!boomAnalysisText) {
      throw new Error("No BOOM analysis found in the article.");
    }

    const combinedPrompt = `Analyze the claim section in the article and focus exclusively on the claims made by original sources cited within the article. Exclude BOOM's analysis, fact-check sections, and the article itself as a source or target.
Consider this claim review block ${claimReviewBlock}
Your response must be strictly in valid JSON format without any additional text, explanations, or formatting. Include the following parameters:

{
  "Heading": "${heading}",
  "DateOfPublication": "${publicationDate}",
  "URL": "${url}",
  "StoryLanguage": "Language of the article",
  "Nature": "Type of story (e.g., Abuse against women, Administrative, Alarmist, Caste, Communal, Domestic violence, Entertainment, Finance, Indian Politics, International Conflict, International affairs, Media, Minor abuse, Mis, Religious, Scripted content, Sports)",
  "Medium": "Medium through which claim was made(e.g., Video, Image, Text)",
  "Target": [
    {
      "type": "individual/organization/community",
      "name": "Name of the target",
      "sentiment": "positive/negative/neutral",
      "justification": "Reason for sentiment classification"
    }
  ],
  "Sentiment": {
    "classification": "Positive/Negative/Neutral",
    "justification": "One-line justification for the overall sentiment classification"
  },
  "Theme/Topic": "Theme/Topic based on article", // e.g., AI manipulation in politics, Banks, Bangladesh elections, Bharat Jodo Yatra, Cinema, Delhi Road rage, Davos 2023 WEF, Epstein case, Hamas-Israel conflict, Impersonation, International politics, Islamophobia, Israel-Palestine War, Japan Earthquake, Japan tsunami, Lok Sabha elections 2024, Maldives-Lakshadweep Row, Manipur ethnic clashes 2024, Mis, Online scam, Political conduct, Political addressal, Public conduct, Public leader praise, Ram Mandir communal clashes, Ram Mandir Inaugration, Rajasthan Politics, Robot in Sports, Smriti Irani's Saudi visit, Sports, Violence on Minors, Wall collapse Uttar Pradesh
  "Theme2": "Theme2 Based on Article",
  "Purpose/Intent": "Purpose or intent behind the claim (e.g., Demographic anxiety, Fake Sensationalism, Financial deception, Gendered attack, Islamophobia, Scam, Satire, Smear Campaign)",
  "Type": "Type of claim (e.g., False content, False context, Fabricated content, Manipulated content, Misleading content.)",
  "Tags": ["Tag1", "Tag2"], // Keywords or tags related to the article
  "ClaimedBy": "${claimReviewBlock.claimedBy}",
  "ClaimedOn": "Claimed on what social media platform",
  "AI": "What type of AI Content was used generating the claim if it was used?(Eg: Deepfake)",
  "OldContent": "Whether the claim is based on outdated content or old content",
  "VerifiedUser": "Indicates if the claim came from a verified user , if there are verified users please provide the count of nummber of verified users or it should provide 0",
  "Violent/Graphic/Inappropriate": "Indicates if the claim involves graphic or inappropriate content"
}

Article content: ${boomAnalysisText}.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an analyst. Focus on the claims made by original sources cited in the article. Provide strictly valid JSON output without additional text.",
        },
        { role: "user", content: combinedPrompt },
      ],
      max_tokens: 4096,
      temperature: 0,
    });

      let responseText = response.choices[0].message.content.trim();

      const cleanedText = responseText.replace(/```json\n|\n```/g, "");
    results = JSON.parse(cleanedText);
    console.log(results);

    return results;
  } catch (error) {
    console.error("Error analyzing sentiment:", error.message);
    return {
      error: "An error occurred during sentiment analysis.",
      details: error.message,
    };
  }
};

const extractBoomAnalysis = async (articleText) => {
  try {
    // Prompt to instruct the model to extract only BOOM's analysis sections
    const prompt = `From the article below, extract only the sections where BOOM provides its analysis or explanations of the claims. Do not include any parts that are purely quotes from the original claim or statements. Focus only on BOOM's fact-checking and explanations, titles and claims**understand who made the claims** and also **overall sentiment**(positive, negative or neutral) got considering sentiments of all the targets in article present. Also understand the **source of claims** and **who made the claim**which are refered by boom analyzed from title, description and claim section(it can be any news channel, social  media account or any video or any individual), also identify who are the targets by the orginal sources claims.
    
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
      temperature: 0,
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
    const intent = await generateIntentForArticle(articleText);

    // console.log(intent);
    res.status(200).json({ sentiment, intent }); // Send back the sentiment analysis
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const extractSentimentFromNews2 = async (req, res) => {
  const { url, text } = req.body;

  // Check if both URL and text are empty
  if (!url && !text) {
    return res.status(400).json({ error: "Either URL or text is required" });
  }

  try {
    let articleText;
    let heading;
    let publicationDate;
    let claimReviewBlock;
    // If text is provided, use it directly
    if (text) {
      articleText = text;
    }
    // If URL is provided, fetch the article content
    else if (url) {
      let articleInfo = await fetchArticleContent2(url);
      articleText = articleInfo.articleText;
      heading = articleInfo.heading;
      publicationDate = articleInfo.publicationDate;
      claimReviewBlock = articleInfo.claimReviewBlock
    }
    console.log(
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4"
    );

    console.log(articleText);
    console.log(
      "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$4"
    );

    const sentiment = await analyzeSentiment2(articleText, heading, url, publicationDate, claimReviewBlock);
    // const intent = await generateIntentForArticle(articleText);

    // console.log(intent);
    res.status(200).json({ sentiment }); // Send back the sentiment analysis
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const fetchArticleContent2 = async (url) => {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = load(htmlContent);
    let articleText = "";
    let heading = ""; // Initialize the heading variable
    let publicationDate = ""; // Initialize the publication date variable
    let claimReviewBlock = {
      claims: "",
      claimedBy: "",
      factCheck: ""
    }; // Initialize claim review block
    // Fetch the heading (first h1 tag)
    heading = $("h1").text().trim(); // Store the h1 text in the heading variable
    publicationDate = $("span[data-datestring]").attr("data-datestring")?.trim(); 
    const claimReview = $("div.claim-review-block");
    if (claimReview.length) {
      // Extract claim text
      claimReviewBlock.claims = claimReview.find(".claim-value .value").first().text().trim();

      // Extract claimed by text
      claimReviewBlock.claimedBy = claimReview.find(".claim-value .value").eq(1).text().trim();

      // Extract fact-check text
      claimReviewBlock.factCheck = claimReview.find(".claim-value .value").last().text().trim();
    }
    // Extract article content
    $("article p").each((index, element) => {
      articleText += $(element).text() + "\n";
    });

    // If no content is found inside the article tag, fall back to paragraphs
    if (!articleText) {
      $("p").each((index, element) => {
        articleText += $(element).text() + "\n";
      });
    }

    console.log("Heading:", heading); // Log the heading for debugging purposes
    console.log("Publication Date:", publicationDate); // Log the publication date for debugging purposes
    console.log("Article Text:", articleText); // Log the article content for debugging purposes
    console.log("Claim Review Block:", claimReviewBlock); // Log the claim review block for debugging purposes
    return {
      heading, // Return heading along with article text
      publicationDate,
      claimReviewBlock,
      articleText: articleText.trim()
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("Error fetching article content");
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
  extractSentimentFromNews2,
};
