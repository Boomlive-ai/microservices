
// const axios = require("axios");
// const { OpenAI } = require("openai");
// require("dotenv").config();

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// /* 🌐 BOOM API Configuration */
// const BOOM_API_CONFIG = {
//   english: {
//     baseUrl: "https://boomlive.in/dev/h-api/news",
//     sessionId: "1w3OEaLmf4lfyBxDl9ZrLPjVbSfKxQ4wQ6MynGpyv1ptdtQ0FcIXfjURSMRPwk1o"
//   },
//   hindi: {
//     baseUrl: "https://hindi.boomlive.in/dev/h-api/news",
//     sessionId: "A2mzzjG2Xnru2M0YC1swJq6s0MUYXVwJ4EpJOub0c2Y8Xm96d26cNrEkAyrizEBD"
//   }
// };

// /* 📰 Fetch BOOM article data by URL */
// const fetchBoomArticleByUrl = async (articleUrl, language = 'english') => {
//   const config = BOOM_API_CONFIG[language];

//   try {
//     // URL encode the article URL
//     const encodedUrl = encodeURIComponent(articleUrl);
    
//     const response = await axios.get(`${config.baseUrl}?url=${encodedUrl}`, {
//       headers: {
//         'accept': '*/*',
//         's-id': config.sessionId
//       }
//     });

//     return response.data.news[0];
//   } catch (error) {
//     throw new Error(`Failed to fetch ${language} article: ${error.message}`);
//   }
// };

// /* 📰 Fetch BOOM article data by ID (keeping for backward compatibility) */
// const fetchBoomArticle = async (newsId, language = 'english') => {
//   const config = BOOM_API_CONFIG[language];

//   try {
//     const response = await axios.get(`${config.baseUrl}?newsId=${newsId}`, {
//       headers: {
//         'accept': '*/*',
//         's-id': config.sessionId
//       }
//     });

//     return response.data.news[0];
//   } catch (error) {
//     throw new Error(`Failed to fetch ${language} article: ${error.message}`);
//   }
// };

// /* 🎯 Generate Hindi context from sample articles */
// const getHindiStyleContext = async () => {
//   const hindiSampleIds = [21672, 29225, 29222, 29219, 29225]; // Add more IDs as needed
//   const contextArticles = [];

//   for (const id of hindiSampleIds) {
//     try {
//       const article = await fetchBoomArticle(id, 'hindi');
//       contextArticles.push({
//         heading: article.heading,
//         description: article.description,
//         storyExcerpt: article.story.substring(0, 500) + "..."
//       });
//     } catch (error) {
//       console.warn(`Could not fetch context article ${id}: ${error.message}`);
//     }
//   }

//   return contextArticles;
// };

// /* 🔧 Preserve embeds during translation */
// const preserveEmbeds = (htmlContent) => {
//   const embedPlaceholders = [];
//   let processedContent = htmlContent;
  
//   // Enhanced regex to match hocal-draggable divs with proper nesting
//   const embedRegex = /<div\s+class="hocal-draggable"[^>]*(?:\s+draggable="true")?[^>]*>(?:(?!<div\s+class="hocal-draggable").)*?<\/div>\s*<\/div>\s*<\/div>/gs;
  
//   const embeds = htmlContent.match(embedRegex) || [];
  
//   // Replace embeds with placeholders
//   embeds.forEach((embed, index) => {
//     const placeholder = `{{EMBED_PLACEHOLDER_${index}}}`;
//     embedPlaceholders.push({
//       placeholder,
//       content: embed
//     });
//     processedContent = processedContent.replace(embed, placeholder);
//   });
  
//   console.log(`Found and preserved ${embedPlaceholders.length} embeds`);
  
//   return {
//     processedContent,
//     embedPlaceholders
//   };
// };

// /* 🔄 Restore embeds after translation */
// const restoreEmbeds = (translatedContent, embedPlaceholders) => {
//   let restoredContent = translatedContent;
  
//   embedPlaceholders.forEach(({ placeholder, content }) => {
//     restoredContent = restoredContent.replace(placeholder, content);
//   });
  
//   console.log(`Restored ${embedPlaceholders.length} embeds`);
  
//   return restoredContent;
// };

// /* 📐 Define OpenAI function schema */
// const hindiArticleSchema = {
//   name: "generateHindiArticle",
//   description: "Generate a Hindi version of a BOOM article with proper formatting and structure",
//   parameters: {
//     type: "object",
//     properties: {
//       heading: { type: "string", description: "Hindi heading" },
//       description: { type: "string", description: "Hindi description" },
//       story: { type: "string", description: "Complete Hindi HTML story with preserved embed placeholders" },
//       tags: { type: "string", description: "Hindi tags" },
//       claim_review: { type: "string", description: "Hindi claim review" },
//       keywords: { type: "string", description: "Hindi keywords" }
//     },
//     required: ["heading", "description", "story", "tags", "claim_review", "keywords"]
//   }
// };

// /* ✨ Convert English BOOM article to Hindi using GPT-4.1-mini + function calling */
// const convertToHindi = async (englishArticle, hindiContext) => {
//   const contextString = hindiContext.map((ctx, index) =>
//     `Example ${index + 1}:
//     Heading: ${ctx.heading}
//     Description: ${ctx.description}
//     Story Style: ${ctx.storyExcerpt}`
//   ).join('\n\n');

//   // Preserve embeds before translation
//   const { processedContent, embedPlaceholders } = preserveEmbeds(englishArticle.story);

//   const prompt = `
// आपको BOOM Live की एक अंग्रेजी फैक्ट-चेक आर्टिकल को हिंदी में कन्वर्ट करना है। BOOM की हिंदी लेखन शैली और टोन को बनाए रखते हुए।

// 🎯 BOOM Hindi Writing Style Guidelines:
// - फैक्ट-चेक आर्टिकल्स के लिए औपचारिक लेकिन सुलभ भाषा का प्रयोग करें
// - "बूम ने अपनी जांच में पाया कि..." जैसे वाक्य संरचना का उपयोग करें
// - क्लेम और फैक्ट चेक सेक्शन को स्पष्ट रूप से अलग करें
// - HTML formatting को बनाए रखें
// - तकनीकी शब्दों के लिए अंग्रेजी और हिंदी दोनों का प्रयोग करें

// ⚠️ CRITICAL INSTRUCTIONS:
// - Keep ALL {{EMBED_PLACEHOLDER_X}} placeholders EXACTLY as they are
// - Do NOT translate these placeholders under any circumstances
// - Maintain their exact position in the content
// - These placeholders represent embedded media (tweets, videos, etc.)

// 📚 BOOM Hindi Style Examples:
// ${contextString}

// 🔹 Convert the following English article to Hindi:
// Heading: ${englishArticle.heading}
// Description: ${englishArticle.description}
// Story: ${processedContent}
// Tags: ${englishArticle.tags}
// Claim Review: ${englishArticle.claim_review}
// Keywords: ${englishArticle.keywords}
// `;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//     functions: [hindiArticleSchema],
//     function_call: { name: "generateHindiArticle" },
//     temperature: 0,
//     max_tokens: 4000
//   });

//   const args = response.choices[0].message.function_call.arguments;
//   const translatedContent = JSON.parse(args);
  
//   // Restore embeds in the translated story
//   translatedContent.story = restoreEmbeds(translatedContent.story, embedPlaceholders);
  
//   return translatedContent;
// };

// /* 🚀 Main function to convert English BOOM article to Hindi by URL */
// const convertBoomArticleToHindiByUrl = async (englishUrl) => {
//   try {
//     console.log(`Fetching English article from URL: ${englishUrl}...`);
//     const englishArticle = await fetchBoomArticleByUrl(englishUrl, 'english');

//     console.log("Fetching Hindi style context...");
//     const hindiContext = await getHindiStyleContext();

//     console.log("Converting to Hindi...");
//     const hindiContent = await convertToHindi(englishArticle, hindiContext);

//     const hindiArticle = {
//       ...englishArticle,
//       heading: hindiContent.heading,
//       description: hindiContent.description,
//       story: hindiContent.story,
//       tags: hindiContent.tags,
//       claim_review: hindiContent.claim_review,
//       keywords: hindiContent.keywords,
//       language: "hindi",
//       translated_from_url: englishUrl,
//       translated_from: englishArticle.newsId, // Keep the original ID for reference
//       translation_timestamp: new Date().toISOString()
//     };

//     return {
//       success: true,
//       data: {
//         news: [hindiArticle]
//       },
//       originalArticle: englishArticle,
//       translatedAt: new Date().toISOString()
//     };

//   } catch (error) {
//     console.error("Translation error:", error);
//     return {
//       success: false,
//       error: error.message,
//       timestamp: new Date().toISOString()
//     };
//   }
// };

// /* 🚀 Main function to convert English BOOM article to Hindi by ID (keeping for backward compatibility) */
// const convertBoomArticleToHindi = async (englishNewsId) => {
//   try {
//     console.log(`Fetching English article ${englishNewsId}...`);
//     const englishArticle = await fetchBoomArticle(englishNewsId, 'english');

//     console.log("Fetching Hindi style context...");
//     const hindiContext = await getHindiStyleContext();

//     console.log("Converting to Hindi...");
//     const hindiContent = await convertToHindi(englishArticle, hindiContext);

//     const hindiArticle = {
//       ...englishArticle,
//       heading: hindiContent.heading,
//       description: hindiContent.description,
//       story: hindiContent.story,
//       tags: hindiContent.tags,
//       claim_review: hindiContent.claim_review,
//       keywords: hindiContent.keywords,
//       language: "hindi",
//       translated_from: englishNewsId,
//       translation_timestamp: new Date().toISOString()
//     };

//     return {
//       success: true,
//       data: {
//         news: [hindiArticle]
//       },
//       originalArticle: englishArticle,
//       translatedAt: new Date().toISOString()
//     };

//   } catch (error) {
//     console.error("Translation error:", error);
//     return {
//       success: false,
//       error: error.message,
//       timestamp: new Date().toISOString()
//     };
//   }
// };

// /* 📱 Express API endpoint - Updated to handle both URL and ID */
// const translateBoomArticle = async (req, res) => {
//   const { newsId, englishUrl, newsUrl } = req.body;

//   // Priority: newsUrl > englishUrl > newsId
//   if (newsUrl || englishUrl) {
//     const articleUrl = newsUrl || englishUrl;
    
//     // Validate URL format
//     if (!articleUrl.includes('boomlive.in')) {
//       return res.status(400).json({
//         error: "Invalid BOOM Live URL. URL must be from boomlive.in domain."
//       });
//     }

//     try {
//       const result = await convertBoomArticleToHindiByUrl(articleUrl);

//       if (result.success) {
//         res.status(200).json(result);
//       } else {
//         res.status(500).json(result);
//       }
//     } catch (error) {
//       console.error("API error:", error);
//       res.status(500).json({
//         error: error.message,
//         timestamp: new Date().toISOString()
//       });
//     }
//   } 
//   else if (newsId) {
//     // Fallback to ID-based approach
//     try {
//       const result = await convertBoomArticleToHindi(newsId);

//       if (result.success) {
//         res.status(200).json(result);
//       } else {
//         res.status(500).json(result);
//       }
//     } catch (error) {
//       console.error("API error:", error);
//       res.status(500).json({
//         error: error.message,
//         timestamp: new Date().toISOString()
//       });
//     }
//   }
//   else {
//     return res.status(400).json({
//       error: "Either newsUrl, englishUrl, or newsId is required"
//     });
//   }
// };

// module.exports = {
//   convertBoomArticleToHindi,
//   convertBoomArticleToHindiByUrl,
//   translateBoomArticle,
//   fetchBoomArticle,
//   fetchBoomArticleByUrl,
//   preserveEmbeds,
//   restoreEmbeds
// };

// // Add this route to your Express app
// // app.post("/api/translateBoomArticle", translateBoomArticle);


const axios = require("axios");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* 🌐 BOOM API Configuration */
const BOOM_API_CONFIG = {
  english: {
    baseUrl: "https://boomlive.in/dev/h-api/news",
    sessionId: "1w3OEaLmf4lfyBxDl9ZrLPjVbSfKxQ4wQ6MynGpyv1ptdtQ0FcIXfjURSMRPwk1o"
  },
  hindi: {
    baseUrl: "https://hindi.boomlive.in/dev/h-api/news",
    sessionId: "A2mzzjG2Xnru2M0YC1swJq6s0MUYXVwJ4EpJOub0c2Y8Xm96d26cNrEkAyrizEBD"
  },
  bangla: {
    baseUrl: "https://bangla.boomlive.in/dev/h-api/news",
    sessionId: "xgjDMdW01R2vQpLH7lsKMb0SB5pDCKhFj7YgnNymTKvWLSgOvIWhxJgBh7153Mbf"
  }
};

/* 📰 Generic fetch by URL */
const fetchBoomArticleByUrl = async (articleUrl, language) => {
  const config = BOOM_API_CONFIG[language];
  const encodedUrl = encodeURIComponent(articleUrl);
  const res = await axios.get(`${config.baseUrl}?url=${encodedUrl}`, {
    headers: { accept: "*/*", "s-id": config.sessionId }
  });
  if (!res.data?.news?.length) throw new Error(`No ${language} article found for URL`);
  return res.data.news[0];
};

/* 📰 Generic fetch by ID */
const fetchBoomArticle = async (newsId, language) => {
  const config = BOOM_API_CONFIG[language];
  const res = await axios.get(`${config.baseUrl}?newsId=${newsId}`, {
    headers: { accept: "*/*", "s-id": config.sessionId }
  });
  if (!res.data?.news?.length) throw new Error(`No ${language} article found for ID`);
  return res.data.news[0];
};

/* 🔧 Preserve embeds */
const preserveEmbeds = (htmlContent) => {
  const embedPlaceholders = [];
  let processedContent = htmlContent || "";
  const embedRegex = /<div\s+class="hocal-draggable"[^>]*>.*?<\/div>/gs;
  const embeds = processedContent.match(embedRegex) || [];
  embeds.forEach((embed, index) => {
    const placeholder = `{{EMBED_PLACEHOLDER_${index}}}`;
    embedPlaceholders.push({ placeholder, content: embed });
    processedContent = processedContent.replace(embed, placeholder);
  });
  return { processedContent, embedPlaceholders };
};

/* 🔄 Restore embeds */
const restoreEmbeds = (translatedContent, embedPlaceholders) => {
  let restoredContent = translatedContent;
  embedPlaceholders.forEach(({ placeholder, content }) => {
    restoredContent = restoredContent.replace(placeholder, content);
  });
  return restoredContent;
};

/* 🎯 Context helpers */
const contextEntry = (a) => ({
  heading: a?.heading || "",
  description: a?.description || "",
  storyExcerpt: (a?.story || "").substring(0, 600) + "..."
});

const getHindiStyleContext = async () => {
  const ids = [21672, 29225, 29222, 29219];
  const ctx = [];
  for (const id of ids) {
    try { ctx.push(contextEntry(await fetchBoomArticle(id, "hindi"))); } catch {}
  }
  return ctx;
};

const getBanglaStyleContext = async () => {
  const urls = [
    "https://bangla.boomlive.in/fact-check/suvendu-adhikari-matangini-hazra-barnaparichay-writer-bjp-tmc-cropped-viral-video-false-claim-fact-check-29234",
    "https://bangla.boomlive.in/explainers/bangla-language-controversy-bangladeshi-amit-malviya-mamata-banerjee-29224",
    "https://bangla.boomlive.in/fact-check/muslim-passenger-slapped-in-indigo-mumbai-kolkata-flight-hindu-false-communal-claim-viral-video-fact-check-29208"
  ];
  const ctx = [];
  for (const u of urls) {
    try { ctx.push(contextEntry(await fetchBoomArticleByUrl(u, "bangla"))); } catch {}
  }
  return ctx;
};

const getEnglishStyleContext = async () => {
  const urls = [
    "https://www.boomlive.in/fact-check/fake-news-viral-photo-dead-bodies-uttrakhand-flash-floods-uttar-pradesh-accident-gonda-29229",
    "https://www.boomlive.in/fact-check/viral-video-boyfriend-beating-his-girlfriend-muslim-hindu-false-communal-claim-scripted-video-factcheck-29217"
  ];
  const ctx = [];
  for (const u of urls) {
    try { ctx.push(contextEntry(await fetchBoomArticleByUrl(u, "english"))); } catch {}
  }
  return ctx;
};

/* 📝 Style guidelines */
const STYLE_GUIDELINES = {
  hindi: `
- औपचारिक लेकिन सुलभ भाषा
- "बूम ने अपनी जांच में पाया..." जैसे वाक्य
- क्लेम और फैक्ट चेक अलग रखें
- HTML और embeds जस के तस रखें`,
  bangla: `
- স্পষ্ট, সংক্ষিপ্ত ও প্রামাণ্য ভাষা
- "বুমের যাচাইয়ে জানা যায়..." ধাঁচে বর্ণনা
- "দাবি" ও "তথ্য যাচাই" অংশ আলাদা
- HTML ও embeds ঠিক রেখে দিন`,
  english: `
- Clear, neutral fact-check tone
- Separate "Claim" and "Fact Check"
- Preserve HTML and embeds`
};

/* 📚 Get style context for target language */
const getStyleContextForTarget = async (lang) => {
  if (lang === "hindi") return await getHindiStyleContext();
  if (lang === "bangla") return await getBanglaStyleContext();
  if (lang === "english") return await getEnglishStyleContext();
  return [];
};

/* 📝 OpenAI schema */
const articleSchema = {
  name: "generateLocalizedArticle",
  description: "Generate localized BOOM article",
  parameters: {
    type: "object",
    properties: {
      heading: { type: "string" },
      description: { type: "string" },
      story: { type: "string" },
      tags: { type: "string" },
      claim_review: { type: "string" },
      keywords: { type: "string" }
    },
    required: ["heading", "description", "story", "tags", "claim_review", "keywords"]
  }
};

/* ✨ Convert between languages */
const convertArticle = async (sourceArticle, targetLanguage) => {
  const styleCtx = await getStyleContextForTarget(targetLanguage);
  const contextString = styleCtx.map((c, i) =>
    `Example ${i + 1}:\nHeading: ${c.heading}\nDescription: ${c.description}\nStory: ${c.storyExcerpt}`
  ).join("\n\n");

  const { processedContent, embedPlaceholders } = preserveEmbeds(sourceArticle.story || "");

  const prompt = `
You are translating a BOOM Live fact-check to ${targetLanguage.toUpperCase()}.

CRITICAL:
- Keep {{EMBED_PLACEHOLDER_X}} in place.
- Preserve HTML structure.

Style Guide:
${STYLE_GUIDELINES[targetLanguage]}

Examples:
${contextString}

Source:
Heading: ${sourceArticle.heading}
Description: ${sourceArticle.description}
Story: ${processedContent}
Tags: ${sourceArticle.tags}
Claim Review: ${sourceArticle.claim_review}
Keywords: ${sourceArticle.keywords}
`;

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    functions: [articleSchema],
    function_call: { name: "generateLocalizedArticle" }
  });

  const args = JSON.parse(resp.choices[0].message.function_call.arguments);
  args.story = restoreEmbeds(args.story, embedPlaceholders);
  return args;
};

/* 🚀 Main Express handler */
const translateBoomArticle = async (req, res) => {
  const { newsId, newsUrl, sourceLanguage, targetLanguage } = req.body;
  const srcLang = (sourceLanguage || "").toLowerCase();
  const tgtLang = (targetLanguage || "").toLowerCase();

  if (!["english", "hindi", "bangla"].includes(tgtLang))
    return res.status(400).json({ error: "Invalid targetLanguage" });

  try {
    let sourceArticle;
    if (newsUrl) {
      const detectedSrc = srcLang || (
        newsUrl.includes("hindi.") ? "hindi" :
        newsUrl.includes("bangla.") ? "bangla" : "english"
      );
      sourceArticle = await fetchBoomArticleByUrl(newsUrl, detectedSrc);
    } else if (newsId) {
      if (!srcLang) return res.status(400).json({ error: "sourceLanguage required for ID" });
      sourceArticle = await fetchBoomArticle(newsId, srcLang);
    } else {
      return res.status(400).json({ error: "newsUrl or newsId required" });
    }

    const localized = await convertArticle(sourceArticle, tgtLang);
    const translated = {
      ...sourceArticle,
      ...localized,
      language: tgtLang,
      translated_from: sourceArticle.newsId,
      translation_timestamp: new Date().toISOString()
    };

    return res.json({ success: true, data: { news: [translated] } });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = { translateBoomArticle };
