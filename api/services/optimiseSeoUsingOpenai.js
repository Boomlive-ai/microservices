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
  // const prompt = `Analyze the following article and determine whether it is a "factcheck" or an "explainer". If the article discusses a claim and its verification, categorize it as "factcheck". Otherwise, categorize it as "explainer".
  const prompt = `Analyze the following article and determine whether it is a "factcheck" or an "explainer in just one word".
    Article content: ${content}`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o or gpt-4 Use the desired OpenAI model (GPT-4 in this case)
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });
    const resultText = result.choices[0].message.content;
    console.log("resultText", resultText); // Log the result for debugging purposes

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
  articleLanguage,
  headline = null,
  description = null
) => {
  console.log("It Is a Fact Check Content");

  const language = articleLanguage;
  // const language = detectLanguage(articleText);
  console.log(language);
  const prompt = `
  You are an SEO and content expert skilled in ${language} fact-checking writing, specifically for Boomlive.in. Analyze the following article and provide optimizations that emulate Boomlive’s tone, structure, and approach, prioritizing reader engagement and search engine visibility. Ensure your response captures the essence of Boomlive content while allowing for creative phrasing.
  
**Examples of Boomlive Titles**:
  - "No, Uddhav Thackeray Did Not Admit To Eating Beef; Cropped Video Viral"
  - "Old Video Of Saudi Blogger Calling Netanyahu Viral With False Claims"
  - "Posts Falsely Claim PM Modi Excluded From BRICS 2024 Leaders’ Photo"
  - "Viral Claim Of Kharge Left Out At Priyanka Gandhi’s Wayanad Nomination Is Misleading"
  -  "Did Nana Patole Say Rahul Gandhi & Congress Would Scrap Reservations? A Fact Check"
  - "OpIndia Falsely Claims LiveLaw Misreported Sharjeel Imam Matters In SC"
  - "Old Video of Salman Khan Peddled As Threat Against Gangster Lawrence Bishnoi"
  - "Video Of Electric Wire Short Circuiting In Flooded Road Is Not From Bengaluru"
  - "Video Of Andhra Pradesh Temple Vandalism Viral With False Communal Claim"
  - "Fake Lokmat Graphic Claims Nana Patole Set To Resign From Congress"


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

  **Article Headline**: ${headline}
  **Article Description**: ${description}
  **Understand the language in which article content is and provide *all* content in the ${language} language(Eg:- English, Hindi, Bangla)**: ${articleText}
  
  **Writing Style Characteristics**:
  - Use straightforward, clear language without jargon.
  - Ensure clarity and brevity in titles and descriptions, aiming for reader engagement.
  - Emphasize contextual relevance, accuracy, and the importance of debunking misinformation.
  - Maintain a neutral yet slightly urgent tone, encouraging readers to understand the implications of misinformation.
  - Integrate emotional triggers or strong verbs to enhance engagement.
  
  **Description Guidelines**:
  - Understand the language in which article content is and provide *all* content in the same language(Eg:- English, Hindi, Bangla)**. Begin each description with "BOOM found that..." to establish authority and context and it can be in english, hindi and bangla.
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
  
  **Writing Style Characteristics**:
  - Use ${
    language === "Hindi"
      ? "Hinglish (Hindi and English mix)"
      : language === "Bangla"
      ? "Bangla-English"
      : "English"
  } depending on article content language.
  - Use straightforward, clear language without jargon.
  - Maintain a neutral yet slightly urgent tone, encouraging readers to understand the implications of misinformation.


  Understand the language in which article content is and provide *all* content in the ${language} and Respond with the JSON format:
  
  {
    "Title": [
      "Provide 3 of Boomlive-style titles only(60-70 characters each) that vary in phrasing but maintain Boomlive’s authoritative tone, capturing the nature of the claim and its validity and the main targets."
    ],
    "Description": [
      "Provide 3 concise, SEO-optimized descriptions in ${language} (160-180 characters each), starting with ${
        language === 'Hindi'
          ? 'बूम ने पाया...'
          : language === 'Bangla'
          ? 'বুম যে পাওয়া গেছে...'
          : 'BOOM found that...'
      } to clarify the claim’s context or finding. Consider article is in ${language}."
    ],

    "Suggested URL": "Suggest a URL directly relevant to the article, formatted with hyphens and reflecting Boomlive’s style.",

    "Tags": "Generate 5-7 specific, SEO-optimized tags that reflect the core aspects of the article and align with Boomlive’s factual tone. Each tag should:

    - **Target User Intent**: Focus on keywords users search for when fact-checking political misinformation, especially related to Middle East politics and viral content analysis.
      
    - **Prioritize Keywords**: Choose low-competition, high-volume keywords to enhance visibility in search engines.
      
    - **Highlight Specifics**: Include key figures, geographic regions, and the context of the misinformation, avoiding generic terms.
      
    - **Reflect Trends**: Capture common terms and current trends in fact-checking and misinformation relevant to the article.

    - **Example Structure**: Use phrases like 'Netanyahu Saudi blogger video', 'Middle East viral misinformation 2023', or '[specific person/region] viral claim'.

    Provide the tags in a comma-separated list in ${language}.",

    "Meta Title": "Create a meta title under 60 characters, combining primary keywords in both English and the article's language for Hindi or Bangla content, as users often search in a mix of languages. For example, ${
      language === "Hindi"
        ? "‘Prayagraj वायरल तस्वीर: BOOM ने बताई सच्चाई,’ ‘PM Modi और COVID Vaccine पर भ्रामक दावा’"
        : language === "Bangla"
        ? "‘Prayagraj ভাইরাল ছবি: আসল সত্য’, ‘PM মোদী ভুয়া খবর যাচাই’"
        : "‘Prime Minister Modi Responds to Viral Image Claims,’ ‘Truth Behind Prayagraj Viral Photo’"
    }. Ensure the title is clear, relevant, and uses primary keywords effectively for SEO."

    "Meta Description": "Create a meta description under 155 characters that summarizes the fact-check analysis in Boomlive’s style. For articles in Hindi or Bangla, use a combination of Hindi and English or Bangla and English words, as users often search in a mix of languages. For example, ${
      language === "Hindi"
        ? "‘BOOM ने भ्रामक दावे का सच बताया – Prayagraj में वायरल तस्वीर की हकीकत’"
        : language === "Bangla"
        ? "‘BOOM জানায় বিভ্রান্তিকর দাবির সত্যতা – Prayagraj ভাইরাল ছবির আসল সত্য’"
        : "‘BOOM clarifies misleading claim – truth behind viral Prayagraj image’"
    }. Ensure this summary captures the main findings in an SEO-friendly format."

    "Sub Headings (H2)": ["Provide 4-6 SEO-optimized H2 subheadings in Boomlive's clear style, suitable for Google snippets."],
    "Sub Headings (H3)": ["Provide 4-6 H3 subheadings that support SEO structure in Boomlive’s tone."],

    "Keywords (Short Tail)": "Generate a list of ${
        language === 'Hindi'
          ? "'Hindi, Hinglish, and English keywords related to the main themes, events, and claims presented in the article. Include both Hindi and English terms. Examples include: 'मुख्य समाचार, हाल की घटनाएँ, तथ्य जांच, वायरल खबरें, सामाजिक मुद्दे', 'Main news, recent events, fact-checking, viral news, social issues'.'"
          : language === 'Bangla'
          ? "'Bangla, Banglish, and English keywords focusing on the key elements of the article. Include a mix of both languages. Examples include: 'সাম্প্রদায়িক দাবি, তথ্যের সত্যতা, সাম্প্রতিক ঘটনা, আইনগত প্রসঙ্গ, সামাজিক প্রসঙ্গ', 'Communal claims, information accuracy, recent events, legal context, social issues'.'"
          :" 'English keywords related to the article's main topics and claims. Examples include: 'current news, recent events, fact-checking, viral claims, social issues'.'"
    }. Include 5-7 SEO-optimized, short-tail keywords closely related to the article's unique aspects. The keywords should:

    - **Focus on Contextual Terms**: Align with popular search terms relevant to the article's content and themes.
    - **Incorporate Relevant Details**: Reflect unique aspects like specific events, claims, or significant details mentioned in the article.
    - **Prioritize SEO for Search Volume and Competition**: Use keywords with high search volume and low competition for improved visibility and engagement.
    - **Format**: Provide in a comma-separated list."


    "Keywords (Long Tail)": "Generate a list of ${
        language === 'Hindi'
          ? "'Hindi, Hinglish, and English long-tail keywords that are highly searched and relevant to the article’s topic. Include keywords that target specific user queries and reflect unique aspects of the content. Examples include: 'हाल की घटनाओं की सच्चाई कैसे जांचें?, साम्प्रদायिक दावों की सत्यता कैसे जानें?, वायरल खबरों की जाँच के लिए कदम क्या हैं?', 'How to check the truth of recent events?, How to verify communal claims?, What are the steps to check viral news?'.'"
          : language === 'Bangla'
          ? "'Bangla, Banglish, and English long-tail keywords that address popular user inquiries related to the article. Include specific keywords that reflect unique content elements. Examples include: 'সাম্প্রদায়িক দাবির সত্যতা যাচাই করার উপায় কি?, সাম্প্রতিক ঘটনার প্রভাব নিয়ে আলোচনা, ভাইরাল খবর যাচাই করার টিপস কি?', 'How to verify the accuracy of communal claims?, Discussion on the impact of recent events, Tips for verifying viral news?'.'"
          : "'English long-tail keywords that are highly searched and relate to the article’s main themes. Include specific keywords that target detailed user queries. Examples include: 'How to fact-check current news?, What are the legal implications of recent events?, Steps for verifying viral claims?.'"
    }. Include 5-7 SEO-optimized, long-tail keywords targeting detailed user queries. Each keyword should:

    - **Capture Specific User Intent**: Craft keywords that directly address distinct user inquiries related to the article, ensuring they are tailored to answer specific questions or concerns.
    - **Highlight Niche Relevance**: Focus on keywords that emphasize particular aspects of the topic, such as recent events, unique claims, or region-specific details, avoiding overly broad keywords.
    - **Match the Article Type**: Align keywords with the content style—whether fact-checking or explanatory—ensuring clarity and informative value while avoiding vague or overused terms.
    - **Prioritize Search Volume and Competition**: Choose keywords with high search volume to enhance visibility and engagement.
    - **Format**: Provide in a comma-separated list."


    "ClaimReview Schema": {
    "Claim": "Provide a comprehensive description of the entire claim being fact-checked, including any relevant context, specifics, and the source of the claim. For example, 'The viral post claims that images of a sword found in Sri Lanka are evidence of the character Kumbhkarna from the Ramayana, suggesting that it is a genuine historical artifact.'",
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
  
  Only provide the output in the language in which article content is written(English, Hindi, Bangla) in JSON format as specified in the language in which article content is written in written(English, Hindi, Bangla) without additional text or commentary. The content should closely mirror Boomlive’s style, ensuring clarity, engagement, and informative accuracy.**Note Meta Title, Meta Description, Keywords (Short Tail) and Keywords (Long Tail) should include English words which are searched by users with the language in ${
    language === "Hindi"
      ? "Hinglish (Hindi and English mix)"
      : language === "Bangla"
      ? "Bangla-English"
      : "English"
  }**
  `;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o", // Use the desired OpenAI model
      max_tokens: 4096,
      temperature: 0.5,
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
  articleLanguage,
  headline = null,
  description = null
) => {
  console.log("IT IS EXPLAINER CONTENT");
  const language = articleLanguage;
  const prompt = ` You are an SEO and content expert skilled in explainer writing, specifically for Boomlive.in. Analyze the following article and provide optimizations that emulate Boomlive’s tone, structure, and approach, prioritizing reader engagement and search engine visibility. Ensure your response captures the essence of Boomlive content while allowing for creative phrasing and should provide response in ${language} language.
  
  **Examples of Boomlive Titles**:
  - "Digital Arrest: India’s New Con Artists Don't Hack Computers—They Hack Minds"
  - "An AI Chatbot Is Being Blamed For A Teenager’s Suicide"
  - "What Does Hamas Leader Yahya Sinwar's Death Mean For The Ongoing War?"
  - "Reels to Rallies: New Report Reveals Influencers as Key Players in Political Narratives"
  - "Explained: Who Exposed Data Of 3 Crore Star Health Customers?"
  - "Why Are Experts Concerned About Airtel's New AI Spam Tool?"
  - "Indian News Channels Give Communal Hue To Gruesome Bengaluru Murder"
  - "Pager Attack On Hezbollah Is An Example Of A Booby Trap: What Does It Mean?"
  - "How AI Images Fueled Pet-Eating Rumours About US Immigrants"
  - "Ayushman Bharat To Cover All Citizens Over 70: How Will The Scheme Work?"
  - "Australia Plans To Ban Social Media For Kids: Is It The Solution?"

  **Examples of Boomlive Descriptions**:
  - "Character.AI has previously made headlines for its AI personas. Recently, a US resident found a chatbot created in the likeness of his daughter, who was murdered in 2006, on the platform."
  - "Israel has described the death of 61-year-old Sinwar as one of the most significant strikes against Hamas since the war began following the group's attacks on October 7, 2023."
  - "Hundreds of pagers used by members of the armed group Hezbollah exploded across Lebanon on Tuesday, killing several people."
 
   **Examples of Boomlive Subheadings for Google Snippets and Search Optimization**:
  - "What Does the Viral Video Claim About Uddhav Thackeray?"
  - "BOOM’s Investigation: How the Original Video Was Edited"
  - "What Did Uddhav Thackeray Actually Say in His Speech?"
  - "Why Is This Video Going Viral Before Maharashtra Elections?"
  - "The Role of Kiren Rijiju’s 2015 Comment in Thackeray’s Speech"
  - "Conclusion: Misleading Edits Distort Uddhav Thackeray’s Statements"
  
  **Article Headline**: ${headline}
  **Article Description**: ${description}
   **Understand the language in which article content is and provide *all* content in the ${language} language**: ${articleText}
  
  **Writing Style Characteristics**:
  - Use straightforward, clear language without jargon.
  - Ensure clarity and brevity in titles and descriptions, aiming for reader engagement.
  - Emphasize contextual relevance, accuracy, and the importance of debunking misinformation.
  - Maintain a neutral yet slightly urgent tone, encouraging readers to understand the implications of misinformation.
  - Integrate emotional triggers or strong verbs to enhance engagement.
    
  **Engagement Factors**:
  - Write content that is captivating and encourages the reader to understand the claim's context and the explainor process.
  - Include calls to action or questions that provoke thought, akin to Boomlive’s engaging approach.
  
  **Citing Sources**:
  - Mention that relevant, reliable sources should be integrated within the content to support claims.
  
  **Content Structure**:
  - Ensure the article follows a logical flow: start with a hook, provide context, detail the claim, and conclude with implications.
  
  **Schema Definitions**:
  - Provide complrte explanations of ClaimReview schema importance in improving visibility and credibility.
  
  Understand the language in which article content is and provide *all* content in the ${language} and Respond with the JSON format:
  {
    "Title": [
      "Provide 3 of Boomlive-style titles only(60-70 characters each) that vary in phrasing but maintain Boomlive’s authoritative tone, capturing the nature of the claim and its validity and the main targets."
    ],

    "Description": [
      "Provide 3 concise, SEO-optimized descriptions in ${language} (160-180 characters each) that clarify the claim’s context or findings, following Boom's style of writing. Each description should be informative and engaging, similar to the following examples: \n\n- The story of APAAR reflects a broader tension in India's education system: the push for digital modernisation versus the need to address fundamental infrastructure and resource gaps. \n  https://www.boomlive.in/explainers/apaar-id-is-india-ready-for-a-national-digital-id-system-for-students-26908 \n\n- पॉलीग्राफ टेस्ट की सटीकता और कोर्ट में इसे सबूत के रूप में पेश किए जाने को लेकर हमेशा सवाल उठते आए हैं. \n  https://hindi.boomlive.in/explainers/kolkata-rape-murder-case-what-is-polygraph-test-on-sanjay-roy-26330 \n\n- এই অনুসন্ধান একটি বিব্রতকর ঘটনা তুলে ধরে যেখানে ভারতের এক যৌন নিপীড়ন ও হত্যার ভুক্তভোগীর ছবি কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে সম্পাদনা করা হয়েছে।"
    ]

    "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url, formatted with hyphens and reflecting Boomlive’s style.",

    "Tags": "Generate 5-7 specific, SEO-optimized tags that reflect the core aspects of the article and align with Boomlive’s factual tone. Each tag should:

    - **Target User Intent**: Focus on keywords users search for when fact-checking political misinformation, especially related to Middle East politics and viral content analysis.
      
    - **Prioritize Keywords**: Choose low-competition, high-volume keywords to enhance visibility in search engines.
      
    - **Highlight Specifics**: Include key figures, geographic regions, and the context of the misinformation, avoiding generic terms.
      
    - **Reflect Trends**: Capture common terms and current trends in fact-checking and misinformation relevant to the article.

    - **Example Structure**: Use phrases like 'Netanyahu Saudi blogger video', 'Middle East viral misinformation 2023', or '[specific person/region] viral claim'.

    Provide the tags in a comma-separated list in ${language}.",

    "Meta Title": "Use a meta title under 60 characters, combining primary keywords in English and the article's language. Examples include: ${
      language === "Hindi"
        ? "प्रधानमंत्री मोदी AI-Generated फोटो पर प्रतिक्रिया, COVID Vaccine पर मिथ্যাচার"
        : language === "Bangla"
        ? "'Durga Puja নিয়ে Viral ভিডিও: সত্যি কি?', 'PM মোদী Fake News নিয়ে জানিয়েছেন গুরুত্বপূর্ণ তথ্য'"
        : "Prime Minister Modi Responds to AI-Generated Photo, COVID Myths Explained"
    }. Provide a meta title under 60 characters using primary keywords.",

    "Meta Description": "Use Hinglish words or a combination of English and Bangla language if the article content is in Hindi or Bangla.Provide a meta description under 155 characters summarizing the explainor analysis in Boomlive’s style",
    "Sub Headings (H2)": ["Provide 4-6 SEO-optimized H2 subheadings in Boomlive's clear style, suitable for Google snippets."],
    "Sub Headings (H3)": ["Provide 4-6 H3 subheadings that support SEO structure in Boomlive’s tone."],

  "Keywords (Short Tail)": "Generate a list of ${
    language === "Hindi"
      ? "'Hindi, Hinglish, and English keywords related to the main themes, events, and claims in the article. Include both Hindi and English terms. Examples: 'मुख्य समाचार, हाल की घटनाएँ, तथ्य जांच, वायरल खबरें, सामाजिक मुद्दे', 'Main news, recent events, fact-checking, viral news, social issues'.'"
      : language === "Bangla"
      ? "'Bangla, Banglish, and English keywords focusing on key elements of the article. Include a mix of both languages. Examples: 'সাম্প্রদায়িক দাবি, তথ্যের সত্যতা, সাম্প্রতিক ঘটনা, আইনগত প্রসঙ্গ, সামাজিক প্রসঙ্গ', 'Communal claims, information accuracy, recent events, legal context, social issues'.'"
      : " 'English keywords related to the article's main topics and claims. Examples: 'current news, recent events, fact-checking, viral claims, social issues'.'"
  }. Include 5-7 SEO-optimized, short-tail keywords closely related to the article's unique aspects. The keywords should:

- **Align with Search Intent**: Use contextual terms popular among users searching for content related to the article's themes.
- **Incorporate Unique Details**: Reflect specific events, claims, or important details mentioned in the article.
- **Prioritize Low Competition, High Volume**: Focus on keywords with significant search volume but moderate competition for better visibility.
- **Format**: Provide in a comma-separated list."

"Keywords (Long Tail)": "Generate a list of ${
    language === "Hindi"
      ? "'Hindi, Hinglish, and English long-tail keywords that are highly searched and relevant to the article’s topic. Include keywords targeting specific user queries and reflecting unique content aspects. Examples: 'हाल की घटनाओं की सच्चाई कैसे जांचें?, साम्प्रদायिक दावों की सत्यता कैसे जानें?, वायरल खबरों की जाँच के लिए कदम क्या हैं?', 'How to check the truth of recent events?, How to verify communal claims?, What are the steps to check viral news?'.'"
      : language === "Bangla"
      ? "'Bangla, Banglish, and English long-tail keywords addressing popular inquiries related to the article. Include specific keywords reflecting unique content elements. Examples: 'সাম্প্রদায়িক দাবির সত্যতা যাচাই করার উপায় কি?, সাম্প্রতিক ঘটনার প্রভাব নিয়ে আলোচনা, ভাইরাল খবর যাচাই করার টিপস কি?', 'How to verify the accuracy of communal claims?, Discussion on the impact of recent events, Tips for verifying viral news?'.'"
      : "'English long-tail keywords highly searched and related to the article’s main themes. Include specific keywords targeting detailed user queries. Examples: 'How to fact-check current news?, What are the legal implications of recent events?, Steps for verifying viral claims?.'"
  }. Include 5-7 SEO-optimized, long-tail keywords targeting detailed user queries. Each keyword should:

- **Directly Address User Intent**: Tailor keywords to answer specific questions or concerns related to the article.
- **Emphasize Niche Relevance**: Highlight particular aspects of the topic, avoiding overly broad keywords.
- **Match Article Type**: Align keywords with the content style—whether fact-checking or explanatory—ensuring clarity and informative value.
- **Prioritize Search Volume**: Select keywords with high search volume for enhanced visibility.
- **Format**: Provide in a comma-separated list."

    "Article Summary Block": {
          "Heading": "A concise, SEO-optimized heading summarizing the article.",
          "Summary": ["Provide a 5-point summary capturing key points in Boomlive's clear style, with each point in one sentence."]
        },
  }
        
  Only provide the output in the language in which article content is wrriten(English, Hindi, Bangla) in JSON format as specified in the language in which content is written orignally (English, Hindi, Bangla) without additional text or commentary. The content should closely mirror Boomlive’s style, ensuring clarity, engagement, and informative accuracy.
  `;

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
  const { headline, description, articleText, articleType, articleLanguage } =
    reqBody;

  if (!articleText) {
    throw new Error("Article content is mandatory.");
  }

  // const articleType = await determineArticleType(articleText);
  console.log(articleType);

  if (articleType == "factcheck") {
    return await optimizeFactcheckSeo(
      articleText,
      articleLanguage,
      headline,
      description
    );
  } else {
    return await optimizeExplainerSeo(
      articleText,
      articleLanguage,
      headline,
      description
    );
  }
};

module.exports = {
  optimizeSeoUsingOpenAI,
};
