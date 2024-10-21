const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Importing the Google Generative AI library
require("dotenv").config();
const marked = require("marked"); // Ensure this line is correct
const he = require("he");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Initialize the client with your API key

// Function to determine article type using Gemini AI
const determineArticleType = async (content) => {
  const prompt = `Analyze the following article and determine whether it is a "factcheck" or an "explainer". If the article discusses a claim and its verification, categorize it as "factcheck". Otherwise, categorize it as "explainer". 

  Article content: ${content}`;

  try {
    const result = await genAI
      .getGenerativeModel({ model: "gemini-1.5-flash" })
      .generateContent([prompt]);
    const resultText = result.response.text();
    // console.log(resultText); // Log the result for debugging purposes

    // Improved logic to check if "factcheck" is mentioned in the result text
    const parsedResponse = resultText.toLowerCase().includes("factcheck")
      ? "factcheck"
      : "explainer";
    // console.log(parsedResponse);

    return parsedResponse;
  } catch (error) {
    console.error("Error determining article type:", error);
    throw new Error("Failed to determine article type.");
  }
};

const parseMarkdown = (text) => {
  const cleanedText = he
    .decode(text) // Decode HTML entities
    .replace(/\n/g, "<br>") // Replace newlines with <br>
    .replace(/\t/g, " "); // Replace tabs with spaces
  return marked.parse(cleanedText);
};


const optimizeFactcheckSeo = async (articleText,headline=null, description=null) => {
  console.log(
    "*********************************************************************"
  );
  console.log("IT IS FACT CHECKING CONTENT");
  console.log(
    "*********************************************************************"
  );

  const prompt = `You are an SEO Expert for a news content publishing website like NYT, Times, boomlive.in.

1) Review this article below as per Google recommendations and SEO practices. Suggest the changes which can make this article both reader-friendly and search engine friendly. Article content: ${articleText}

2) Suggest meta keywords both short and long-tail that users may search for the stories. Give them in a comma-separated format.

3) Suggest SEO-friendly meta title and meta description in Google-recommended character length. Use boomlive.in tone but best in SEO practice.

4) Suggest claim review for this article. Write Claim: and Factcheck:

5) Write a fact-check summary for this article with Claim and Factcheck title.

Now, provide the following parameters in JSON format based on the article analysis:

{
  "Title": "",
  "Description": "",
  "Suggested URL": "",
  "Keyword": "",
  "Tags": "",
  "Meta Title": "",
  "Meta Description": "",
  "Sub Headings (H2, H3)": "",
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
      "Heading": "",
      "Summary": ["", "", "", "", ""]
  },
  "How We Did It As A Fact Checking Organization": [
      "Step 1: ",
      "Step 2: ",
      "Step n: "
  ]
}`;

  try {
    const result = await genAI
      .getGenerativeModel({ model: "gemini-1.5-flash" })
      .generateContent([prompt]);
    const resultText = result.response.text();
    console.log(resultText); // For debugging

    // Extract the JSON part of the response
    const jsonResponseStart = resultText.indexOf("{");
    const jsonResponseEnd = resultText.lastIndexOf("}");
    const jsonString = resultText.substring(
      jsonResponseStart,
      jsonResponseEnd + 1
    );

    const jsonResponse = JSON.parse(jsonString);

    // Clean the 'Sub Headings (H2, H3)' field
    jsonResponse["Sub Headings (H2, H3)"] = jsonResponse[
      "Sub Headings (H2, H3)"
    ]
      .replace(/## /g, "") // Remove '## ' symbols
      .replace(/\n/g, ""); // Remove new line characters

    return jsonResponse; // Return the JSON object
  } catch (error) {
    console.error("Error generating fact-check SEO:", error);
    throw new Error("Failed to generate fact-check SEO.");
  }
};


const optimizeExplainerSeo = async (articleText,headline=null, description=null) => {
  console.log(
    "*********************************************************************"
  );
  console.log("IT IS EXPLAINER CONTENT");
  console.log(
    "*********************************************************************"
  );

  const prompt = `You are an SEO Expert for a news content publishing website like NYT, Times, boomlive.in.

1) Review this article below as per Google recommendations and SEO practices. Suggest the changes which can make this article both reader-friendly and search engine friendly. Article content: ${articleText}

2) Suggest meta keywords both short and long-tail that users may search for the stories. Give them in a comma-separated format.

3) Suggest SEO-friendly meta title and meta description in Google-recommended character length. Use boomlive.in tone but best in SEO practice.

4) Write headings and a summary for this article in 4-5 bullet points.

Now, provide the following parameters in JSON format based on the article analysis:

{
  "Title": "",
  "Description": "",
  "Suggested URL": "",
  "Keyword": "",
  "Tags": "",
  "Meta Title": "",
  "Meta Description": "",
  "Sub Headings (H2)": "",
  "Sub Headings (H3)": "",
  "Keywords (Short and Long Tail)": "",
  "Article Summary Block": {
      "Heading": "",
      "Summary": ["", "", "", "", ""]
  }
}`;

  try {
    const result = await genAI
      .getGenerativeModel({ model: "gemini-1.5-flash" })
      .generateContent([prompt]);
    const resultText = result.response.text();
    console.log(resultText); // For debugging

    // Extract the JSON part of the response
    const jsonResponseStart = resultText.indexOf("{");
    const jsonResponseEnd = resultText.lastIndexOf("}");
    const jsonString = resultText.substring(
      jsonResponseStart,
      jsonResponseEnd + 1
    );

    const jsonResponse = JSON.parse(jsonString);

    // Clean the 'Sub Headings (H2, H3)' field
    jsonResponse["Sub Headings (H2, H3)"] = jsonResponse[
      "Sub Headings (H2, H3)"
    ]
      .replace(/## /g, "") // Remove '## ' symbols
      .replace(/\n/g, ""); // Remove new line characters

    return jsonResponse; // Return the JSON object
  } catch (error) {
    console.error("Error generating explainer SEO:", error);
    throw new Error("Failed to generate explainer SEO.");
  }
};

// Main function to optimize SEO based on article type
const optimizeSeoUsingGemini = async (reqBody) => {
  const { headline, description, articleText } = reqBody;

  if (!articleText) {
    throw new Error("Article content is mandatory.");
  }

  const articleType = await determineArticleType(articleText);
  console.log(articleType);

  if (articleType == "factcheck") {
    return await optimizeFactcheckSeo(articleText, headline, description);
  } else {
    return await optimizeExplainerSeo(articleText, headline, description);
  }
};

module.exports = {
  optimizeSeoUsingGemini,
};
