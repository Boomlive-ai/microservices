const { OpenAI } = require("openai");
const marked = require("marked");
const he = require("he");
require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});

// // Function to determine article type using OpenAI
// const determineArticleType = async (content) => {
//   // const prompt = `Analyze the following article and determine whether it is a "factcheck" or an "explainer". If the article discusses a claim and its verification, categorize it as "factcheck". Otherwise, categorize it as "explainer".
//   const prompt = `Analyze the following article and determine whether it is a "factcheck" or an "explainer in just one word".
//     Article content: ${content}`;

//   try {
//     const result = await openai.chat.completions.create({
//       model: "gpt-4o", // gpt-4o or gpt-4 Use the desired OpenAI model (GPT-4 in this case)
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 2000,
//       temperature: 0.7,
//     });
//     const resultText = result.choices[0].message.content;
//     console.log("resultText", resultText); // Log the result for debugging purposes

//     const parsedResponse = resultText.toLowerCase().includes("factcheck")
//       ? "factcheck"
//       : "explainer";

//     return parsedResponse;
//   } catch (error) {
//     console.error("Error determining article type:", error);
//     throw new Error("Failed to determine article type.");
//   }
// };


const optimizeFactcheckSeo = async (
  articleText,
  articleLanguage,
  focusKeywords,
  headline = null,
  description = null
) => {
  const language = articleLanguage.toLowerCase();;
  console.log("It Is a Fact Check Content in ",language);
  console.log(`These are focus keywords or sentences: ${focusKeywords}`);

  // const language = detectLanguage(articleText);
  const prompt = `
  You are an SEO and content expert skilled in ${language} fact-checking writing, specifically for Boomlive.in. Analyze the following article and provide optimizations that emulate Boomlive’s tone, structure, and approach, prioritizing reader engagement and search engine visibility. Ensure your response captures the essence of Boomlive content while allowing for creative phrasing.
  
**Need to use these Focus Keywords or Sentences by default in all content generated**: ${focusKeywords}

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
  **Need to use these Focus Keywords or Sentences by default in all content generated**: ${focusKeywords}

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
    language === "hindi"
      ? "Hinglish (Hindi and English mix)"
      : language === "bangla"
      ? "Bangla-English"
      : "English"
  } depending on article content language.
  - Use straightforward, clear language without jargon.
  - Maintain a neutral yet slightly urgent tone, encouraging readers to understand the implications of misinformation.


  Understand the language in which article content is and provide *all* content in the ${language} and **make sure to include these focus keywords or focus sentences in the content ${focusKeywords}**,  Refer to Boomlive factcheck articles (https://www.boomlive.in/fact-check) for inspiration.Respond with the JSON format:
  
  {
    "Title": [
      "Provide 3 Boomlive-style titles (70-80 characters each) that vary in phrasing but maintain Boomlive’s authoritative tone, capturing the nature of the claim and its validity. Use the following headline styles as a guide to create engaging, SEO-friendly options:",
      
      "- **Clear True or False Statements**: Directly address the claim and provide a clear answer. Example: ‘False: Modi Did Not Congratulate Trump with a Call About Bangladesh and Canada’",
      
      "- **Question-Based Headlines**: Pose the claim as a question to draw readers in. Example: ‘Did PM Modi Schedule a Call with Trump to Discuss Khalistani Terrorism? Here’s the Truth’",
      
      "- **Claim vs. Fact Format**: Separate the claim from the fact to establish a fact-check angle. Example: ‘Claim vs. Fact: India Today Anchor Reads Parody Modi Tweet on Trump’s Win’",
      
      "- **Debunking Style Headlines**: Use words like ‘Debunked’ or ‘Misleading’ to indicate a false claim. Example: ‘Debunked: Parody Tweet Misattributed to Modi on Trump’s Election Win’",
      
      "- **Social Media Angle**: Highlight claims that went viral on specific platforms. Example: ‘Viral on X: Fake Modi Tweet on Trump and Khalistani Terrorism Explained’",
      
      "- **Emphasizing the Misinformation Source**: Specify if the claim came from a parody or altered image. Example: ‘Parody Account Impersonates PM Modi: India Today Anchor Misreads Fake Tweet’",
      
      "- **Timely/Event-Based Headlines**: Connect the fact-check to recent events. Example: ‘Fact-Check: Did Modi Congratulate Trump with a Call on ‘Khalistani Terrorism’ After His 2024 Win?’",
      
      "- **Comparative Headlines**: Highlight the difference between fake and real content. Example: ‘Real vs. Fake: Modi’s Actual Congratulatory Tweet vs. Viral Parody Post’"
      
    ]

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

    "Meta Title": "Create a meta title under 60 characters, combining primary keywords in both English and ${language}, as users often search in a mix of English-${language}. For example, ${
      language === "hindi"
        ? "‘PM Modi और COVID Vaccine पर भ्रामक दावा’"
        : language === "bangla"
        ? "PM মোদী ভুয়া খবর যাচাই"
        : "‘Prime Minister Modi Responds to Viral Image Claims,’ ‘Truth Behind Prayagraj Viral Photo’"
    }. Ensure the title is clear, relevant, and uses primary keywords effectively for SEO."

    "Meta Description": "Create a meta description under 155 characters that summarizes the fact-check analysis in Boomlive’s style. For articles in ${language} , use a combination of ${language} and English , as users often search in a mix of English-${language}. For example, ${
      language === "hindi"
        ? "‘BOOM ने भ्रामक दावे का सच बताया – Prayagraj में वायरल तस्वीर की हकीकत’"
        : language === "bangla"
        ? "‘BOOM জানায় বিভ্রান্তিকর দাবির সত্যতা – Prayagraj ভাইরাল ছবির আসল সত্য’"
        : "‘BOOM clarifies misleading claim – truth behind viral Prayagraj image’"
    }. Ensure this summary captures the main findings in an SEO-friendly format."

    "Sub Headings (H2)": ["Provide 4-6 SEO-optimized H2 subheadings in Boomlive's clear style, suitable for Google snippets."],
    "Sub Headings (H3)": ["Provide 4-6 H3 subheadings that support SEO structure in Boomlive’s tone."],

    "Keywords (Short Tail)": "Generate a list of atleast 10 short tail keywords which include focus keywords from this ${focusKeywords} should order the important short-tail keywords first in order and don't include generic keywords at all like **prevent using these (viral video claim, misinformation, fact-check, viral video, false viral claim, social media)** ${
        language === 'Hindi'
          ? "'Hindi, Hinglish, and English keywords related to the main themes, events, and claims presented in the article. Include both Hindi and English terms.'"
          : language === 'Bangla'
          ? "'Bangla, Banglish, and English keywords focusing on the key elements of the article. Include a mix of both languages.'"
          :" 'English keywords related to the article's main topics and claims.'"
    }. Include atleast 10 SEO-optimized, short-tail keywords closely related to the article's unique aspects. Each of 10 or more keywords  should be in English-${language} language and should prioritize important or main keywords first in order:

    - **Focus on Contextual Terms**: Align with popular search terms relevant to the article's content and themes.
    - **Incorporate Relevant Details**: Reflect unique aspects like specific events, claims, or significant details mentioned in the article.
    - **Prioritize SEO for Search Volume and Competition**: Use keywords with high search volume and low competition for improved visibility and engagement.
    - **Format**: Provide in a comma-separated list and should prioritize important or main keywords first in order."


    "Keywords (Long Tail)": "Generate a list of minimum 10 long tail keywords which include focus keywords or sentences from this ${focusKeywords} should order the important longtail keywords first in order and don't include generic keywords like (understanding misinformation, steps to verify, impact of misleading videos, viral video misrepresents)${
        language === 'Hindi'
          ? "'Hindi, Hinglish, and English long-tail keywords that are highly searched and relevant to the article’s topic. Include keywords that target specific user queries and reflect unique aspects of the content.'"
          : language === 'Bangla'
          ? "'Bangla, Banglish, and English long-tail keywords that address popular user inquiries related to the article. Include specific keywords that reflect unique content elements. '"
          : "'English long-tail keywords that are highly searched and relate to the article’s main themes. Include specific keywords that target detailed user queries.'"
    }. Include atleast 10 SEO-optimized, long-tail keywords targeting detailed user queries. Each of 10 or more keywords should and should priopritize important or main keywords first in order:

    - **Capture Specific User Intent**: Craft keywords that directly address distinct user inquiries related to the article, ensuring they are tailored to answer specific questions or concerns.
    - **Highlight Niche Relevance**: Focus on keywords that emphasize particular aspects of the topic, such as recent events, unique claims, or region-specific details, avoiding overly broad keywords.
    - **Match the Article Type**: Align keywords with the content style—whether fact-checking or explanatory—ensuring clarity and informative value while avoiding vague or overused terms.
    - **Prioritize Search Volume and Competition**: Choose keywords with high search volume to enhance visibility and engagement.
    - **Format**: Provide in a comma-separated list and should priopritize important or main keywords first in order."


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
    language === "hindi"
      ? "Hinglish (Hindi and English mix)"
      : language === "bangla"
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


const optimizeExplainerSeo = async (
  articleText,
  articleLanguage,
  focusKeywords,
  headline = null,
  description = null
) => {
  const language = articleLanguage.toLowerCase();
  console.log("IT IS EXPLAINER CONTENT in ", language);
  console.log(`These are focus keywords or sentences: ${focusKeywords}`);
  
  const prompt = ` You are an SEO and content expert skilled in explainer writing, specifically for Boomlive.in. Analyze the following article and provide optimizations that emulate Boomlive’s tone, structure, and approach, prioritizing reader engagement and search engine visibility. Ensure your response captures the essence of Boomlive content while allowing for creative phrasing and should provide response in ${language} language.
  
  **Need to use these Focus Keywords or Sentences by default in all content generated**: ${focusKeywords}
  
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
  **Need to use these Focus Keywords or Sentences by default in all content generated**: ${focusKeywords}

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
  
  Understand the language in which article content is and provide *all* content in the ${language}  and **make sure to include these focus keywords or focus sentences in the content ${focusKeywords}**. Respond with the JSON format:
  {
    "Title": [
      "Provide 3 Explainers title of Boomlive-style titles only(70-80 characters each) that vary in phrasing but maintain Boomlive’s authoritative tone, capturing the nature of the claim and its validity and the main targets. Refer to examples above and Boomlive explainer articles (https://www.boomlive.in/explainers) for inspiration. Notable headline styles for BoomLive include:
      
        1. **Question-Based Headlines**: Spark curiosity and invite readers to seek answers.
          - Example: 'Is India’s Judiciary Truly Independent? Examining CJI Chandrachud’s Tenure'

        2. **Fact-Driven Headlines**: Bold statements to attract quick information seekers.
          - Example: 'Over 600 Judgements: How CJI Chandrachud’s Rulings Shaped Modern India'

        3. **'How' and 'Why' Headlines**: Explain complex issues in an informative way.
          - Example: 'How CJI Chandrachud’s Legacy Redefined Privacy and Women’s Rights in India'

        4. **Subversive or Contrarian Headlines**: Challenge popular opinion or beliefs.
          - Example: 'Why CJI Chandrachud’s Reforms May Not Be Enough to Modernize India’s Courts'

        5. **List-Based Headlines**: Provide scannable, multiple insights.
          - Example: '5 Landmark Judgements That Defined CJI Chandrachud’s Legacy'

        6. **'What You Need to Know' Headlines**: Condense complex topics for essentials.
          - Example: 'CJI Chandrachud’s Retirement: What You Need to Know About His Legacy'

        7. **Descriptive Headlines with Emotional Impact**: Combine detail with emotive words.
          - Example: 'The Unfulfilled Promise: Reflecting on CJI Chandrachud’s Complex Legacy'

      Provide 3 Boomlive-style titles that reflect these styles, formatted for SEO engagement and relevance.",
    ]

    "Description": [
      "Provide 3 concise, SEO-optimized descriptions in ${language} (160-180 characters each) that clarify the claim’s context or findings, following Boom's style of writing. Each description should be informative and engaging, similar to the following examples: \n\n- The story of APAAR reflects a broader tension in India's education system: the push for digital modernisation versus the need to address fundamental infrastructure and resource gaps. \n  https://www.boomlive.in/explainers/apaar-id-is-india-ready-for-a-national-digital-id-system-for-students-26908 \n\n- पॉलीग्राफ टेस्ट की सटीकता और कोर्ट में इसे सबूत के रूप में पेश किए जाने को लेकर हमेशा सवाल उठते आए हैं. \n  https://hindi.boomlive.in/explainers/kolkata-rape-murder-case-what-is-polygraph-test-on-sanjay-roy-26330 \n\n- এই অনুসন্ধান একটি বিব্রতকর ঘটনা তুলে ধরে যেখানে ভারতের এক যৌন নিপীড়ন ও হত্যার ভুক্তভোগীর ছবি কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে সম্পাদনা করা হয়েছে।"
    ]

    "Suggested URL": "A URL that includes main keywords both (long tail and short tail), main keywords from title and relevant tags to get more seo firendly url, formatted with hyphens and reflecting Boomlive’s style.",

    "Tags": "Generate 5-7 specific, SEO-optimized tags that reflect the core aspects of the article and align with Boomlive’s explainers tone. Each tag should:

    - **Target User Intent**: Focus on keywords users search for when  political misinformation, especially related to Middle East politics and viral content analysis.
      
    - **Prioritize Keywords**: Choose low-competition, high-volume keywords to enhance visibility in search engines.
      
    - **Highlight Specifics**: Include key figures, geographic regions, and the context of the misinformation, avoiding generic terms.
      
    - **Reflect Trends**: Capture common terms and current trends in  misinformation relevant to the article.

    - **Example Structure**: Use phrases like 'Netanyahu Saudi blogger video', 'Middle East viral misinformation 2023', or '[specific person/region] viral claim'.

    Provide the tags in a comma-separated list in ${language}.",

    "Meta Title": "Use a meta title under 60 characters, combining primary keywords in English and ${language} language , as users often search in a mix of English-${language}. Examples include: ${
      language === "hindi"
        ? " COVID Vaccine पर मिथ্যাচার"
        : language === "bangla"
        ? "'Durga Puja নিয়ে Viral ভিডিও: সত্যি কি?', 'PM মোদী Fake News নিয়ে জানিয়েছেন গুরুত্বপূর্ণ তথ্য'"
        : "Prime Minister Modi Responds to AI-Generated Photo, COVID Myths Explained"
    }. Provide a meta title under 60 characters using primary keywords.",

    "Meta Description": "Create a meta description under 155 characters that summarizes the explainer analysis in Boomlive’s style. For articles in ${language} , use a combination of ${language} and English , as users often search in a mix of English-${language}. Ensure this summary captures the main findings in an SEO-friendly format.",

    "Sub Headings (H2)": ["Provide 4-6 SEO-optimized H2 subheadings in Boomlive's clear style, suitable for Google snippets."],
    "Sub Headings (H3)": ["Provide 4-6 H3 subheadings that support SEO structure in Boomlive’s tone."],

    "Keywords (Short Tail)": "Generate a list of minimum 10 explainer short tail keywords which include focus keywords from this ${focusKeywords} should order the important short-tail keywords first in order and don't include generic keywords at all like **prevent using these (viral video claim, misinformation, fact-check, viral video, false viral claim, social media)** ${
        language === 'Hindi'
          ? "'Hindi, Hinglish, and English keywords related to the main themes, events, and claims presented in the article. Include both Hindi and English terms.'"
          : language === 'Bangla'
          ? "'Bangla, Banglish, and English keywords focusing on the key elements of the article. Include a mix of both languages.'"
          :" 'English keywords related to the article's main topics and claims.'"
    }. Include atleast 10 SEO-optimized, short-tail keywords closely related to the article's unique aspects. Each of 10 or more keywords  should be in English-${language} language and should prioritize important or main keywords first in order:

- **Align with Search Intent**: Use contextual terms popular among users searching for content related to the article's themes.
- **Incorporate Unique Details**: Reflect specific events, claims, or important details mentioned in the article.
- **Prioritize Low Competition, High Volume**: Focus on keywords with significant search volume but moderate competition for better visibility.
- **Format**: Provide in a comma-separated list and should prioritize important or main keywords first in order."

"Keywords (Long Tail)": "Generate a list of minimum 10 long tail keywords for explainers which include focus keywords or sentences from this ${focusKeywords} should order the important longtail keywords first in order and don't include generic keywords like (understanding misinformation, steps to verify, impact of misleading videos, viral video misrepresents)${
        language === 'Hindi'
          ? "'Hindi, Hinglish, and English long-tail keywords that are highly searched and relevant to the article’s topic. Include keywords that target specific user queries and reflect unique aspects of the content.'"
          : language === 'Bangla'
          ? "'Bangla, Banglish, and English long-tail keywords that address popular user inquiries related to the article. Include specific keywords that reflect unique content elements. '"
          : "'English long-tail keywords that are highly searched and relate to the article’s main themes. Include specific keywords that target detailed user queries.'"
    }. Include atleast 10 SEO-optimized, long-tail keywords targeting detailed user queries. Each keyword should and should priopritize important or main keywords first in order:

- **Directly Address User Intent**: Tailor keywords to answer specific questions or concerns related to the article.
- **Emphasize Niche Relevance**: Highlight particular aspects of the topic, avoiding overly broad keywords.
- **Match Article Type**: Align keywords with the content style—whether explanatory—ensuring clarity and informative value.
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
  const { headline, description, articleText, articleType, articleLanguage, focusKeywords } =
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
      focusKeywords,
      headline,
      description
    );
  } else {
    return await optimizeExplainerSeo(
      articleText,
      articleLanguage,
      focusKeywords,
      headline,
      description
    );
  }
};

module.exports = {
  optimizeSeoUsingOpenAI,
};
