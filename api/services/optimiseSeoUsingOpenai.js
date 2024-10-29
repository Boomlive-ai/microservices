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

// // Function to optimize SEO for fact-checking content
// const optimizeFactcheckSeo = async (
//   articleText,
//   headline = null,
//   description = null
// ) => {
//   console.log("IT IS FACT CHECKING CONTENT");

//   const prompt = `You are an SEO Expert for a news content publishing website like  boomlive.in.
  
//   1) Review the following article for SEO best practices to enhance its reader-friendliness and search engine optimization. Use the tone of boomlive.in while applying best SEO practices. Article content: ${articleText}

//   2) Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets.
//   Provide the following parameters in JSON format based on the article analysis:
//   {
//   "Title": [
//     "Title1: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
//     "Title2: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
//     "Title3: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**"
//   ],
//     "Description": [
//       "Description1: A clear, concise statement like description in breif summarizing the article.",
//       "Description2: A clear, concise statement like description in breif summarizing the article.",
//       "Description3: A clear, concise statement like description in breif summarizing the article."
//     ],
//     "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url.",
//     "Tags": "Provide minimum atleast 20 specific tags with high search volume and low competition (ideally under 40). Avoid generic or broad terms, such as 'Privacy Concerns' or 'Unwanted Calls.' Ensure the tags are niche-focused, directly relevant to the article content, and align with the tone of boomlive.in.  Eg. tag1, tag2,...,tagn",
//     "Meta Title": "A concise title that includes relevant keywords.",
//     "Meta Description": "A summary of the article's analysis, starting with actions taken, e.g., 'Boom analyzed this article to clarify false claims.'",
//     "Sub Headings (H2)": [Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets Eg: "", "","",..,""],
//     "Sub Headings (H3)": [ Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets Eg: "","","",..,""],
//     "Keywords (Short and Long Tail)": "Suggest meta keywords both short and long-tail that users may search for the stories   with high search volume and low competition. Eg. keyword1, keyword2,...,keywordn",
//     "ClaimReview Schema": {
//         "Claim": "Mention the complete claim mentioned in the article",
//         "Fact-Check": "True or False"
//     },
//     "Factcheck Summary": {
//         "Claim": "",
//         "Fact-Check": ""
//     },
//     "Article Summary Block": {
//         "Heading": "A summarized heading for the article.",
//         "Summary": ["", "", "", "", ""]
//     },
//     "How We Did It": [
//         "Step 1: ",
//         "Step 2: ",
//         "Step n: "
//     ]
//   }`;

//   try {
//     const result = await openai.chat.completions.create({
//       model: "gpt-4o", // Use the desired OpenAI model // gpt-4o  or // gpt-4o
//       max_tokens: 4096,
//       temperature: 0.5,
//       messages: [{ role: "user", content: prompt }],
//     });
//     const resultText = result.choices[0].message.content;
//     console.log(resultText); // For debugging

//     const jsonResponseStart = resultText.indexOf("{");
//     const jsonResponseEnd = resultText.lastIndexOf("}");
//     const jsonString = resultText.substring(
//       jsonResponseStart,
//       jsonResponseEnd + 1
//     );

//     const jsonResponse = JSON.parse(jsonString);
//     console.log(jsonResponse);

//     // jsonResponse["Sub Headings (H2)"] = jsonResponse["Sub Headings (H2)"]
//     //   .replace(/## /g, "") // Remove '## ' symbols
//     //   .replace(/\n/g, ""); // Remove new line characters
//     // jsonResponse["Sub Headings (H3)"] = jsonResponse["Sub Headings (H3)"]
//     //   .replace(/## /g, "") // Remove '## ' symbols
//     //   .replace(/\n/g, ""); // Remove new line characters
//     return jsonResponse; // Return the JSON object
//   } catch (error) {
//     console.error("Error generating fact-check SEO:", error);
//     throw new Error("Failed to generate fact-check SEO.");
//   }
// };


const optimizeFactcheckSeo = async (
  articleText,
  headline = null,
  description = null
) => {
  console.log("Optimizing content to closely mirror Boomlive style and SEO guidelines");

  const prompt = `
  You are an SEO and content expert skilled in fact-checking writing, specifically for Boomlive.in. Analyze the following article and provide optimizations that emulate Boomlive’s tone, structure, and approach, prioritizing reader engagement and search engine visibility. Ensure your response captures the essence of Boomlive content while allowing for creative phrasing.
  
  **Examples of Boomlive Titles**:
  - "No, Uddhav Thackeray Did Not Admit To Eating Beef; Cropped Video Viral"
  - "Old Video Of Saudi Blogger Calling Netanyahu Viral With False Claims"
  - "Posts Falsely Claim PM Modi Excluded From BRICS 2024 Leaders’ Photo"
  - "Viral Claim Of Kharge Left Out At Priyanka Gandhi’s Wayanad Nomination Is Misleading"


  **Examples of Boomlive Descriptions**:
  - "BOOM found that the visuals have been overlaid with an AI-generated voice clone to falsely claim the death of Dr. Bimal Chhajer."
  - "BOOM found that the original video shows Thackeray criticising the BJP and referring to Union Minister Kiren Rijiju's 2015 statement on eating beef, which has been cropped out."
 
   **Examples of Boomlive Subheadings for Google Snippets and Search Optimization**:
  - "What Does the Viral Video Claim About Uddhav Thackeray?"
  - "BOOM’s Investigation: How the Original Video Was Edited"
  - "What Did Uddhav Thackeray Actually Say in His Speech?"
  - "Why Is This Video Going Viral Before Maharashtra Elections?"
  - "The Role of Kiren Rijiju’s 2015 Comment in Thackeray’s Speech"
  - "Conclusion: Misleading Edits Distort Uddhav Thackeray’s Statements"
  
  **Article Content**: ${articleText}
  
  **Writing Style Characteristics**:
  - Use straightforward, clear language without jargon.
  - Ensure clarity and brevity in titles and descriptions, aiming for reader engagement.
  - Emphasize contextual relevance, accuracy, and the importance of debunking misinformation.
  - Maintain a neutral yet slightly urgent tone, encouraging readers to understand the implications of misinformation.
  - Integrate emotional triggers or strong verbs to enhance engagement.
  
  **Description Guidelines**:
  - Begin each description with "BOOM found that..." to establish authority and context.
  - Clearly summarize the findings while maintaining the structure and tone of the provided examples.
  - Keep descriptions concise, ideally around 20-30 words, focusing on what has been misrepresented in the original claim.
  
  **Engagement Factors**:
  - Write content that is captivating and encourages the reader to understand the claim's context and the fact-check process.
  - Include calls to action or questions that provoke thought, akin to Boomlive’s engaging approach.
  
  **Citing Sources**:
  - Mention that relevant, reliable sources should be integrated within the content to support claims.
  
  **Content Structure**:
  - Ensure the article follows a logical flow: start with a hook, provide context, detail the claim, and conclude with implications.
  
  **Schema Definitions**:
  - Provide explanations of ClaimReview schema importance in improving visibility and credibility.
  
  Respond with the JSON format specified:
  
  {
    "Title": [
      "Provide 3 of Boomlive-style titles only(60-70 characters each) that vary in phrasing but maintain Boomlive’s authoritative tone, capturing the nature of the claim and its validity and the main targets."
    ],
    "Description": [
      "Provide 3 concise, SEO-optimized descriptions  in (160-180 characters each), starting with 'BOOM found that...' to clarify the claim’s context or finding."
    ],
    "Suggested URL": "Suggest a URL directly relevant to the article, formatted with hyphens and reflecting Boomlive’s style.",
    "Tags":"Generate a set of 5-7 highly specific, SEO-optimized tags that reflect core aspects of the article and align with Boomlive’s factual tone and audience. Each tag should:

    Target User Search Intent: Aim for terms users might search when fact-checking or exploring political misinformation, with an emphasis on high-relevance keywords for Middle East politics, misinformation verification, and viral content analysis.

    Prioritize Low-Competition, High-Volume Keywords: Focus on keywords and phrases with higher search volume but moderate-to-low competition, optimizing for visibility in search engines.

    Include Specific People, Regions, and Topics: Highlight distinct details such as key figures, geographic regions, and the viral misinformation context, avoiding generic tags.

    Capture Related Trends in Fact-Checking and Misinformation: Use tags that reflect current trends or common terms within fact-checking and political misinformation, creating relevance for readers interested in these themes.

    Example Structure: 'Netanyahu Saudi blogger video', 'Middle East viral misinformation 2023', '[specific person or region]' combined with ‘viral claim’ or ‘false claim’ phrasing.

    Avoid general terms, crafting each tag with precision for relevance to Boomlive’s fact-checking approach and the article’s specific misinformation claim.",
    "Meta Title": "Provide a meta title under 60 characters using primary keywords.",
    "Meta Description": "Provide a meta description under 155 characters summarizing the fact-check analysis in Boomlive’s style, e.g., 'BOOM clarifies misleading claim.'",
    "Sub Headings (H2)": ["Provide 4-6 SEO-optimized H2 subheadings in Boomlive's clear style, suitable for Google snippets."],
    "Sub Headings (H3)": ["Provide 4-6 H3 subheadings that support SEO structure in Boomlive’s tone."],
    "Keywords (Short Tail)": "Generate a list of 5-7 highly specific, SEO-optimized short-tail keywords related to the article's topic. The keywords should:

Focus on Unique Aspects: Identify distinctive terms that accurately reflect the main themes or subjects of the article, ensuring they capture niche topics rather than generic terms.
Incorporate Relevant Context: Include keywords that are particularly relevant to the nuances of fact-checking or explanatory content, avoiding overly broad or commonly used phrases.
Prioritize Search Volume and Competition: Choose keywords with high search volume that also have lower competition, enhancing the potential for visibility and engagement.
Format: Provide in a comma-separated list.",
    "Keywords (Long Tail)": "Generate a list of 5-7 detailed, SEO-optimized long-tail keywords that address specific queries related to the article’s topic. Each keyword should:

Capture Specific User Intent: Phrase keywords to align with unique user inquiries relevant to the article, ensuring they go beyond generic phrases and address particular concerns or interests.
Highlight Niche Relevance: Focus on keywords that speak to particular details of the topic, such as recent events, lesser-known facts, or specific angles, avoiding broad keywords that lack specificity.
Match the Article Type: Tailor keywords to resonate with the content style—either fact-checking or explanatory—emphasizing clarity and informative nature without using common or vague language.
Format: Provide in a comma-separated list.",
    "ClaimReview Schema": {
      "Claim": "State the full claim being fact-checked.",
      "Fact-Check": "Label the claim as 'True' or 'False' based on the fact-check."
    },
    "Factcheck Summary": {
      "Claim": "Provide a Boomlive-style summary of the claim.",
      "Fact-Check": "Briefly explain the verification outcome in a paragraph."
    },
    "Article Summary Block": {
      "Heading": "A concise, SEO-optimized heading summarizing the article.",
      "Summary": ["Provide a 5-point summary capturing key points in Boomlive's clear style, with each point in one sentence."]
    },
    "How We Did It": [
      "Step 1: Describe each verification step in Boomlive’s concise style.",
      "Step 2: Include another brief verification step...",
      "Step n: Continue for all verification steps."
    ]
  }
  
  Only provide the output in JSON format as specified, without additional text or commentary. The content should closely mirror Boomlive’s style, ensuring clarity, engagement, and informative accuracy.
  `;
  
  
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // Use the desired OpenAI model
      max_tokens: 4096,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const resultText = result.choices[0].message.content;
    const jsonResponseStart = resultText.indexOf("{");
    const jsonResponseEnd = resultText.lastIndexOf("}");
    const jsonString = resultText.substring(
      jsonResponseStart,
      jsonResponseEnd + 1
    );

    const jsonResponse = JSON.parse(jsonString);
    console.log(jsonResponse);

    return jsonResponse;
  } catch (error) {
    console.error("Error generating fact-check SEO:", error);
    throw new Error("Failed to generate fact-check SEO.");
  }
};


// const optimizeExplainerSeo = async (
//   articleText,
//   headline = null,
//   description = null
// ) => {
//   console.log("IT IS EXPLAINER CONTENT");

//   const prompt = `You are an SEO Expert for a news content publishing website like boomlive.in.
//   1) Review the following article for SEO best practices to enhance its reader-friendliness and search engine optimization. Use the tone of boomlive.in while applying best SEO practices. Article content: ${articleText}


  
//   2) Subheadings ( H2 & H3 ) should be seo firendly and suitable google snippets.
//   Provide the following parameters in JSON format:
//   {
//       "Title": [
//     "Title1: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
//     "Title2: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**",
//     "Title3: Capture the article's core context in 60-70 characters, aligned with Google’s recommendations. **Do not use colons (:) anywhere in the title. Rephrase the title naturally to avoid colons, and ensure it flows as a single phrase or sentence. Examples of unacceptable titles: 'Jaipur RSS Attack: No Communal Angle.' Instead, use phrases like 'Jaipur RSS Workers Attack Debunked for False Claims.'**"
//   ],
//     "Description": [
//       "Description1: A clear, concise statement like description in breif summarizing the article.",
//       "Description2: A clear, concise statement like description in breif summarizing the article.",
//       "Description3: A clear, concise statement like description in breif summarizing the article."
//     ],
//     "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url.",
//     "Tags": "Provide minimum atleast 20 specific tags with high search volume and low competition (ideally under 40). Avoid generic or broad terms, such as 'Privacy Concerns' or 'Unwanted Calls.' Ensure the tags are niche-focused, directly relevant to the article content, and align with the tone of boomlive.in.  Eg. tag1, tag2,...,tagn",
//     "Meta Title": "A concise title that includes relevant keywords.",
//     "Meta Title": "A concise title that includes relevant keywords.",
//     "Meta Description": "A summary of the article's analysis, starting with actions taken, e.g., 'Boom analyzed this article to clarify false claims.'",
//     "Sub Headings (H2)": ["", "", "", ""],
//     "Sub Headings (H3)": ["", "", "", ""],
//     "Keywords (Short and Long Tail)": "A list of short and long-tail keywords that users may search for the stories",
//     "Article Summary Block": {
//       "Heading": "A summarized heading for the article.",
//       "Summary": ["", "", "", "", ""]
//     }
//   }`;

//   try {
//     const result = await openai.chat.completions.create({
//       model: "gpt-4o", // Specify the desired OpenAI model // gpt-4
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 4096,
//       temperature: 0.5,
//     });

//     const resultText = result.choices[0].message.content;

//     const jsonResponseStart = resultText.indexOf("{");
//     const jsonResponseEnd = resultText.lastIndexOf("}");
//     const jsonString = resultText.substring(
//       jsonResponseStart,
//       jsonResponseEnd + 1
//     );

//     const jsonResponse = JSON.parse(jsonString);

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

  const prompt = ` You are an SEO and content expert skilled in fact-checking writing, specifically for Boomlive.in. Analyze the following article and provide optimizations that emulate Boomlive’s tone, structure, and approach, prioritizing reader engagement and search engine visibility. Ensure your response captures the essence of Boomlive content while allowing for creative phrasing.
  
  **Examples of Boomlive Titles**:
  - "No, Uddhav Thackeray Did Not Admit To Eating Beef; Cropped Video Viral"
  - "Old Video Of Saudi Blogger Calling Netanyahu Viral With False Claims"
  - "Posts Falsely Claim PM Modi Excluded From BRICS 2024 Leaders’ Photo"
  - "Viral Claim Of Kharge Left Out At Priyanka Gandhi’s Wayanad Nomination Is Misleading"


  **Examples of Boomlive Descriptions**:
  - "BOOM found that the visuals have been overlaid with an AI-generated voice clone to falsely claim the death of Dr. Bimal Chhajer."
  - "BOOM found that the original video shows Thackeray criticising the BJP and referring to Union Minister Kiren Rijiju's 2015 statement on eating beef, which has been cropped out."
 
   **Examples of Boomlive Subheadings for Google Snippets and Search Optimization**:
  - "What Does the Viral Video Claim About Uddhav Thackeray?"
  - "BOOM’s Investigation: How the Original Video Was Edited"
  - "What Did Uddhav Thackeray Actually Say in His Speech?"
  - "Why Is This Video Going Viral Before Maharashtra Elections?"
  - "The Role of Kiren Rijiju’s 2015 Comment in Thackeray’s Speech"
  - "Conclusion: Misleading Edits Distort Uddhav Thackeray’s Statements"
  
  **Article Content**: ${articleText}
  
  **Writing Style Characteristics**:
  - Use straightforward, clear language without jargon.
  - Ensure clarity and brevity in titles and descriptions, aiming for reader engagement.
  - Emphasize contextual relevance, accuracy, and the importance of debunking misinformation.
  - Maintain a neutral yet slightly urgent tone, encouraging readers to understand the implications of misinformation.
  - Integrate emotional triggers or strong verbs to enhance engagement.
  
  **Description Guidelines**:
  - Begin each description with "BOOM found that..." to establish authority and context.
  - Clearly summarize the findings while maintaining the structure and tone of the provided examples.
  - Keep descriptions concise, ideally around 20-30 words, focusing on what has been misrepresented in the original claim.
  
  **Engagement Factors**:
  - Write content that is captivating and encourages the reader to understand the claim's context and the fact-check process.
  - Include calls to action or questions that provoke thought, akin to Boomlive’s engaging approach.
  
  **Citing Sources**:
  - Mention that relevant, reliable sources should be integrated within the content to support claims.
  
  **Content Structure**:
  - Ensure the article follows a logical flow: start with a hook, provide context, detail the claim, and conclude with implications.
  
  **Schema Definitions**:
  - Provide explanations of ClaimReview schema importance in improving visibility and credibility.
  
  Respond with the JSON format specified:
  {
    "Title": [
      "Provide 3 of Boomlive-style titles only(60-70 characters each) that vary in phrasing but maintain Boomlive’s authoritative tone, capturing the nature of the claim and its validity and the main targets."
    ],
    "Description": [
      "Provide 3 concise, SEO-optimized descriptions  in (160-180 characters each), starting with 'BOOM found that...' to clarify the claim’s context or finding."
    ],
    "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url, formatted with hyphens and reflecting Boomlive’s style.",
    "Tags":"Generate a set of 5-7 highly specific, SEO-optimized tags that reflect core aspects of the article and align with Boomlive’s factual tone and audience. Each tag should:

        Target User Search Intent: Aim for terms users might search when fact-checking or exploring political misinformation, with an emphasis on high-relevance keywords for Middle East politics, misinformation verification, and viral content analysis.

        Prioritize Low-Competition, High-Volume Keywords: Focus on keywords and phrases with higher search volume but moderate-to-low competition, optimizing for visibility in search engines.

        Include Specific People, Regions, and Topics: Highlight distinct details such as key figures, geographic regions, and the viral misinformation context, avoiding generic tags.

        Capture Related Trends in Fact-Checking and Misinformation: Use tags that reflect current trends or common terms within fact-checking and political misinformation, creating relevance for readers interested in these themes.

        Example Structure: 'Netanyahu Saudi blogger video', 'Middle East viral misinformation 2023', '[specific person or region]' combined with ‘viral claim’ or ‘false claim’ phrasing.

        Avoid general terms, crafting each tag with precision for relevance to Boomlive’s fact-checking approach and the article’s specific misinformation claim.",
    "Meta Title": "Provide a meta title under 60 characters using primary keywords.",
    "Meta Description": "Provide a meta description under 155 characters summarizing the fact-check analysis in Boomlive’s style, e.g., 'BOOM clarifies misleading claim.'",
    "Sub Headings (H2)": ["Provide 4-6 SEO-optimized H2 subheadings in Boomlive's clear style, suitable for Google snippets."],
    "Sub Headings (H3)": ["Provide 4-6 H3 subheadings that support SEO structure in Boomlive’s tone."],
  "Keywords (Short Tail)": "Generate a list of 5-7 highly specific, SEO-optimized short-tail keywords related to the article's topic. The keywords should:

Focus on Unique Aspects: Identify distinctive terms that accurately reflect the main themes or subjects of the article, ensuring they capture niche topics rather than generic terms.
Incorporate Relevant Context: Include keywords that are particularly relevant to the nuances of fact-checking or explanatory content, avoiding overly broad or commonly used phrases.
Prioritize Search Volume and Competition: Choose keywords with high search volume that also have lower competition, enhancing the potential for visibility and engagement.
Format: Provide in a comma-separated list.",
    "Keywords (Long Tail)": "Generate a list of 5-7 detailed, SEO-optimized long-tail keywords that address specific queries related to the article’s topic. Each keyword should:

Capture Specific User Intent: Phrase keywords to align with unique user inquiries relevant to the article, ensuring they go beyond generic phrases and address particular concerns or interests.
Highlight Niche Relevance: Focus on keywords that speak to particular details of the topic, such as recent events, lesser-known facts, or specific angles, avoiding broad keywords that lack specificity.
Match the Article Type: Tailor keywords to resonate with the content style—either fact-checking or explanatory—emphasizing clarity and informative nature without using common or vague language.
Format: Provide in a comma-separated list.",
    "Article Summary Block": {
          "Heading": "A concise, SEO-optimized heading summarizing the article.",
          "Summary": ["Provide a 5-point summary capturing key points in Boomlive's clear style, with each point in one sentence."]
        },
  }`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // Specify the desired OpenAI model // gpt-4
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.7,
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
