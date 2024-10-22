const { OpenAI } = require("openai");
const marked = require("marked");
const he = require("he");
require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});

// Function to determine article type using OpenAI
const determineArticleType = async (content) => {
  const prompt = `Analyze the following article and determine whether it is a "factcheck" or an "explainer". If the article discusses a claim and its verification, categorize it as "factcheck". Otherwise, categorize it as "explainer". 
  
    Article content: ${content}`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // gpt-3.5-turbo or gpt-4 Use the desired OpenAI model (GPT-4 in this case) 
      messages: [{ role: "user", content: prompt }],
    });
    const resultText = result.choices[0].message.content;
    console.log(resultText); // Log the result for debugging purposes

    const parsedResponse = resultText.toLowerCase().includes("factcheck")
      ? "factcheck"
      : "explainer";

    return parsedResponse;
  } catch (error) {
    console.error("Error determining article type:", error);
    throw new Error("Failed to determine article type.");
  }
};

// Function to optimize SEO for fact-checking content
const optimizeFactcheckSeo = async (
  articleText,
  headline = null,
  description = null
) => {
  console.log("IT IS FACT CHECKING CONTENT");

  const prompt = `You are an SEO Expert for a news content publishing website like NYT, Times, boomlive.in.
  
  1) Review this article below as per SEO best practices. Suggest the changes which can make this article both reader-friendly and search engine-friendly. Article content: ${articleText}
  
  2) Suggest meta keywords both short and long-tail that users may search for the stories. Give them in a comma-separated format.
  
  3) Suggest SEO-friendly meta title and meta description in Google-recommended character length. Use boomlive.in tone but best in SEO practice.
  
  4) Suggest claim review for this article. Write Claim: and Factcheck:
  
  5) Write a fact-check summary for this article with Claim and Factcheck title.
  
  Provide the following parameters in JSON format based on the article analysis:
  
  {
    "Title": "",
    "Description": "",
    "Suggested URL": "",
    "Keyword": "",
    "Tags": "",
    "Meta Title": "",
    "Meta Description": "",
    "Sub Headings (H2)": ["", "","",""],
    "Sub Headings (H3)": ["","","",""],
    "Keywords (Short and Long Tail)": "",
    "ClaimReview Schema": {
        "Claim": "",
        "Fact-Check": ""
    },
    "Factcheck Summary": {
        "Claim": "",
        "Fact-Check": ""
    },
    "Article Summary Block": {
        "Heading": "Genearte Summarised Article Heading",
        "Summary": ["", "", "", "", ""]
    },
    "How We Did It As A Fact Checking Organization": [
        "Step 1: ",
        "Step 2: ",
        "Step n: "
    ]
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use the desired OpenAI model
      messages: [{ role: "user", content: prompt }],
    });
    const resultText = result.choices[0].message.content;
    console.log(resultText); // For debugging

    const jsonResponseStart = resultText.indexOf("{");
    const jsonResponseEnd = resultText.lastIndexOf("}");
    const jsonString = resultText.substring(
      jsonResponseStart,
      jsonResponseEnd + 1
    );

    const jsonResponse = JSON.parse(jsonString);
    console.log(jsonResponse);
    console.error("Error generating fact-check SEO:", error);

    // jsonResponse["Sub Headings (H2)"] = jsonResponse["Sub Headings (H2)"]
    //   .replace(/## /g, "") // Remove '## ' symbols
    //   .replace(/\n/g, ""); // Remove new line characters
    // jsonResponse["Sub Headings (H3)"] = jsonResponse["Sub Headings (H3)"]
    //   .replace(/## /g, "") // Remove '## ' symbols
    //   .replace(/\n/g, ""); // Remove new line characters
    return jsonResponse; // Return the JSON object
  } catch (error) {
    console.error("Error generating fact-check SEO:", error);
    throw new Error("Failed to generate fact-check SEO.");
  }
};

// Function to optimize SEO for explainer content
const optimizeExplainerSeo = async (
  articleText,
  headline = null,
  description = null
) => {
  console.log("IT IS EXPLAINER CONTENT");

  const prompt = `You are an SEO Expert for a news content publishing website like NYT, Times, boomlive.in.
  
  1) Review this article below as per SEO best practices. Suggest the changes which can make this article both reader-friendly and search engine-friendly. Article content: ${articleText}
  
  2) Suggest meta keywords both short and long-tail that users may search for the stories. Give them in a comma-separated format.
  
  3) Suggest SEO-friendly meta title and meta description in Google-recommended character length. Use boomlive.in tone but best in SEO practice.
  
  4) Write headings and a summary for this article in 4-5 bullet points.
  
  Provide the following parameters in JSON format based on the article analysis:
  
  {
    "Title": "",
    "Description": "",
    "Suggested URL": "",
    "Keyword": "",
    "Tags": "",
    "Meta Title": "",
    "Meta Description": "",
    "Sub Headings (H2)": ["", "","",""],
    "Sub Headings (H3)": ["","","",""],
    "Keywords (Short and Long Tail)": "",
    "Article Summary Block": {
        "Heading": "Genearte Summarised Article Heading",
        "Summary": ["", "", "", "", ""]
    }
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use the desired OpenAI model
      messages: [{ role: "user", content: prompt }],
    });
    const resultText = result.choices[0].message.content;
    // console.log(resultText); // For debugging

    const jsonResponseStart = resultText.indexOf("{");
    const jsonResponseEnd = resultText.lastIndexOf("}");
    const jsonString = resultText.substring(
      jsonResponseStart,
      jsonResponseEnd + 1
    );
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5");
    
    console.log(resultText);
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5");

    const jsonResponse = JSON.parse(jsonString);

    // jsonResponse["Sub Headings (H2, H3)"] = jsonResponse[
    //   "Sub Headings (H2, H3)"
    // ]
    //   .replace(/## /g, "") // Remove '## ' symbols
    //   .replace(/\n/g, ""); // Remove new line characters
    console.error("Error generating explainer SEO:", error);

    return jsonResponse; // Return the JSON object
  } catch (error) {
    console.error("Error generating explainer SEO:", error);
    throw new Error("Failed to generate explainer SEO.");
  }
};

// Main function to optimize SEO based on article type
const optimizeSeoUsingOpenAI = async (reqBody) => {
  const { headline, description, articleText } = reqBody;

  if (!articleText) {
    throw new Error("Article content is mandatory.");
  }

  const articleType = await determineArticleType(articleText);
  console.log(articleType);

  if (articleType === "factcheck") {
    return await optimizeFactcheckSeo(articleText, headline, description);
  } else {
    return await optimizeExplainerSeo(articleText, headline, description);
  }
};

module.exports = {
  optimizeSeoUsingOpenAI,
};
