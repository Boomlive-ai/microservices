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
      model: "gpt-4o", // gpt-4o or gpt-4 Use the desired OpenAI model (GPT-4 in this case)
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.5,
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

  const prompt = `You are an SEO Expert for a news content publishing website like  boomlive.in.
  
  1) Review the following article for SEO best practices to enhance its reader-friendliness and search engine optimization. Use the tone of boomlive.in while applying best SEO practices. Article content: ${articleText}

  2) Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets.
  Provide the following parameters in JSON format based on the article analysis:
  {
  "Title": [
    "Title1: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
    "Title2: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
    "Title3: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**"
  ],
    "Description": [
      "Description1: A clear, concise statement like description in breif summarizing the article.",
      "Description2: A clear, concise statement like description in breif summarizing the article.",
      "Description3: A clear, concise statement like description in breif summarizing the article."
    ],
    "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url.",
    "Tags": "Provide minimum atleast 20 specific tags with high search volume and low competition (ideally under 40). Avoid generic or broad terms, such as 'Privacy Concerns' or 'Unwanted Calls.' Ensure the tags are niche-focused, directly relevant to the article content, and align with the tone of boomlive.in.  Eg. tag1, tag2,...,tagn",
    "Meta Title": "A concise title that includes relevant keywords.",
    "Meta Description": "A summary of the article's analysis, starting with actions taken, e.g., 'Boom analyzed this article to clarify false claims.'",
    "Sub Headings (H2)": [Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets Eg: "", "","",..,""],
    "Sub Headings (H3)": [ Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets Eg: "","","",..,""],
    "Keywords (Short and Long Tail)": "Suggest meta keywords both short and long-tail that users may search for the stories   with high search volume and low competition. Eg. keyword1, keyword2,...,keywordn",
    "ClaimReview Schema": {
        "Claim": "Mention the complete claim mentioned in the article",
        "Fact-Check": "True or False"
    },
    "Factcheck Summary": {
        "Claim": "",
        "Fact-Check": ""
    },
    "Article Summary Block": {
        "Heading": "A summarized heading for the article.",
        "Summary": ["", "", "", "", ""]
    },
    "How We Did It": [
        "Step 1: ",
        "Step 2: ",
        "Step n: "
    ]
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // Use the desired OpenAI model // gpt-4o  or // gpt-4o
      max_tokens: 4096,
      temperature: 0.5,
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
// const optimizeExplainerSeo = async (
//   articleText,
//   headline = null,
//   description = null
// ) => {
//   console.log("IT IS EXPLAINER CONTENT");

//   const prompt = `You are an SEO Expert for a news content publishing website like boomlive.in.

//   1) Review this article below as per SEO best practices to make changes which can make this article both reader-friendly and search engine-friendly and should Use boomlive.in tone but best in SEO practice . Article content: ${articleText}

//   Provide the following parameters in JSON format based on the article analysis:

//   {
//     "Title": ["Title1 should be based on comprehension of the core article context in 60-70 characters to fit Google-recommended character lengthh","Title2 should be based on comprehension of the core  article context in 60-70 characters in Google-recommended character length", "Title3 should be based on comprehension of the core article context in 60-70 characters to fit Google-recommended character length"]
//     "Description": ["Description1 should be more like a statement", "Description2 should be more like a statement","Description3 should be more like a statement"],
//     "Suggested URL": "The suggested url include the main keywords provided and title generated and tags",
//     "Tags": "Tags should be very specific based on more search volume and less competition **below 40**, it should not inlcude any generic tags and should Use boomlive.in tone but best in SEO practice",
//     "Meta Title": "The meta title should include keywords",
//     "Meta Description": "Meta Description should describe what boom analysed from the article.It should start with what boom performed actions on article For Eg: Boom Analysed this video shows false information about the claim",
//     "Sub Headings (H2)": ["", "","",""],
//     "Sub Headings (H3)": ["","","",""],
//     "Keywords (Short and Long Tail)": "Suggest meta keywords both short and long-tail that users may search for the stories",
//     "Article Summary Block": {
//         "Heading": "Genearte Summarised Article Heading",
//         "Summary": ["", "", "", "", ""]
//     }
//   }`;

//   try {
//     const result = await openai.chat.completions.create({
//       model: "gpt-4", // Use the desired OpenAI model // gpt-4o // gpt-4
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 4096,
//       temperature: 0.5,
//     });
//     const resultText = result.choices[0].message.content;
//     // console.log(resultText); // For debugging

//     const jsonResponseStart = resultText.indexOf("{");
//     const jsonResponseEnd = resultText.lastIndexOf("}");
//     const jsonString = resultText.substring(
//       jsonResponseStart,
//       jsonResponseEnd + 1
//     );
//     console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5");

//     console.log(resultText);
//     console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5");

//     const jsonResponse = JSON.parse(jsonString);

//     // jsonResponse["Sub Headings (H2, H3)"] = jsonResponse[
//     //   "Sub Headings (H2, H3)"
//     // ]
//     //   .replace(/## /g, "") // Remove '## ' symbols
//     //   .replace(/\n/g, ""); // Remove new line characters

//     return jsonResponse; // Return the JSON object
//   } catch (error) {
//     console.error("Error generating explainer SEO:", error);
//     throw new Error("Failed to generate explainer SEO.");
//   }
// };
const optimizeExplainerSeo = async (
  articleText,
  headline = null,
  description = null
) => {
  console.log("IT IS EXPLAINER CONTENT");

  const prompt = `You are an SEO Expert for a news content publishing website like boomlive.in.
  1) Review the following article for SEO best practices to enhance its reader-friendliness and search engine optimization. Use the tone of boomlive.in while applying best SEO practices. Article content: ${articleText}


  
  2) Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets.
  Provide the following parameters in JSON format:
  {
      "Title": [
    "Title1: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
    "Title2: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
    "Title3: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**"
  ],
    "Description": [
      "Description1: A clear, concise statement like description in breif summarizing the article.",
      "Description2: A clear, concise statement like description in breif summarizing the article.",
      "Description3: A clear, concise statement like description in breif summarizing the article."
    ],
    "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url.",
    "Tags": "Provide minimum atleast 20 specific tags with high search volume and low competition (ideally under 40). Avoid generic or broad terms, such as 'Privacy Concerns' or 'Unwanted Calls.' Ensure the tags are niche-focused, directly relevant to the article content, and align with the tone of boomlive.in.  Eg. tag1, tag2,...,tagn",
    "Meta Title": "A concise title that includes relevant keywords.",
    "Meta Title": "A concise title that includes relevant keywords.",
    "Meta Description": "A summary of the article's analysis, starting with actions taken, e.g., 'Boom analyzed this article to clarify false claims.'",
    "Sub Headings (H2)": ["", "", "", ""],
    "Sub Headings (H3)": ["", "", "", ""],
    "Keywords (Short and Long Tail)": "A list of short and long-tail keywords that users may search for the stories",
    "Article Summary Block": {
      "Heading": "A summarized heading for the article.",
      "Summary": ["", "", "", "", ""]
    }
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // Specify the desired OpenAI model // gpt-4
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.5,
    });

    const resultText = result.choices[0].message.content;

    const jsonResponseStart = resultText.indexOf("{");
    const jsonResponseEnd = resultText.lastIndexOf("}");
    const jsonString = resultText.substring(
      jsonResponseStart,
      jsonResponseEnd + 1
    );

    const jsonResponse = JSON.parse(jsonString);

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
