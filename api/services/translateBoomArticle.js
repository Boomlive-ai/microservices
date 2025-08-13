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
//   },
//   bangla: {
//     baseUrl: "https://bangla.boomlive.in/dev/h-api/news",
//     sessionId: "xgjDMdW01R2vQpLH7lsKMb0SB5pDCKhFj7YgnNymTKvWLSgOvIWhxJgBh7153Mbf"
//   }
// };

// /* 📰 Generic fetch by URL */
// const fetchBoomArticleByUrl = async (articleUrl, language) => {
//   const config = BOOM_API_CONFIG[language];
//   const encodedUrl = encodeURIComponent(articleUrl);
//   const res = await axios.get(`${config.baseUrl}?url=${encodedUrl}`, {
//     headers: { accept: "*/*", "s-id": config.sessionId }
//   });
//   if (!res.data?.news?.length) throw new Error(`No ${language} article found for URL`);
//   return res.data.news[0];
// };

// /* 📰 Generic fetch by ID */
// const fetchBoomArticle = async (newsId, language) => {
//   const config = BOOM_API_CONFIG[language];
//   const res = await axios.get(`${config.baseUrl}?newsId=${newsId}`, {
//     headers: { accept: "*/*", "s-id": config.sessionId }
//   });
//   if (!res.data?.news?.length) throw new Error(`No ${language} article found for ID`);
//   return res.data.news[0];
// };

// /* 🔧 Preserve embeds */
// const preserveEmbeds = (htmlContent) => {
//   const embedPlaceholders = [];
//   let processedContent = htmlContent || "";
//   const embedRegex = /<div\s+class="hocal-draggable"[^>]*>.*?<\/div>/gs;
//   const embeds = processedContent.match(embedRegex) || [];
//   embeds.forEach((embed, index) => {
//     const placeholder = `{{EMBED_PLACEHOLDER_${index}}}`;
//     embedPlaceholders.push({ placeholder, content: embed });
//     processedContent = processedContent.replace(embed, placeholder);
//   });
//   return { processedContent, embedPlaceholders };
// };

// /* 🔄 Restore embeds */
// const restoreEmbeds = (translatedContent, embedPlaceholders) => {
//   let restoredContent = translatedContent;
//   embedPlaceholders.forEach(({ placeholder, content }) => {
//     restoredContent = restoredContent.replace(placeholder, content);
//   });
//   return restoredContent;
// };

// /* 🎯 Context helpers */
// const contextEntry = (a) => ({
//   heading: a?.heading || "",
//   description: a?.description || "",
//   storyExcerpt: (a?.story || "").substring(0, 600) + "..."
// });

// const getHindiStyleContext = async () => {
//   const ids = [21672, 29225, 29222, 29219];
//   const ctx = [];
//   for (const id of ids) {
//     try { ctx.push(contextEntry(await fetchBoomArticle(id, "hindi"))); } catch {}
//   }
//   return ctx;
// };

// const getBanglaStyleContext = async () => {
//   const urls = [
//     "https://bangla.boomlive.in/fact-check/suvendu-adhikari-matangini-hazra-barnaparichay-writer-bjp-tmc-cropped-viral-video-false-claim-fact-check-29234",
//     "https://bangla.boomlive.in/explainers/bangla-language-controversy-bangladeshi-amit-malviya-mamata-banerjee-29224",
//     "https://bangla.boomlive.in/fact-check/muslim-passenger-slapped-in-indigo-mumbai-kolkata-flight-hindu-false-communal-claim-viral-video-fact-check-29208"
//   ];
//   const ctx = [];
//   for (const u of urls) {
//     try { ctx.push(contextEntry(await fetchBoomArticleByUrl(u, "bangla"))); } catch {}
//   }
//   return ctx;
// };

// const getEnglishStyleContext = async () => {
//   const urls = [
//     "https://www.boomlive.in/fact-check/fake-news-viral-photo-dead-bodies-uttrakhand-flash-floods-uttar-pradesh-accident-gonda-29229",
//     "https://www.boomlive.in/fact-check/viral-video-boyfriend-beating-his-girlfriend-muslim-hindu-false-communal-claim-scripted-video-factcheck-29217"
//   ];
//   const ctx = [];
//   for (const u of urls) {
//     try { ctx.push(contextEntry(await fetchBoomArticleByUrl(u, "english"))); } catch {}
//   }
//   return ctx;
// };

// /* 📝 Style guidelines */
// const STYLE_GUIDELINES = {
//   hindi: `
// - औपचारिक लेकिन सुलभ भाषा
// - "बूम ने अपनी जांच में पाया..." जैसे वाक्य
// - क्लेम और फैक्ट चेक अलग रखें
// - HTML और embeds जस के तस रखें`,
//   bangla: `
// - স্পষ্ট, সংক্ষিপ্ত ও প্রামাণ্য ভাষা
// - "বুমের যাচাইয়ে জানা যায়..." ধাঁচে বর্ণনা
// - "দাবি" ও "তথ্য যাচাই" অংশ আলাদা
// - HTML ও embeds ঠিক রেখে দিন`,
//   english: `
// - Clear, neutral fact-check tone
// - Separate "Claim" and "Fact Check"
// - Preserve HTML and embeds`
// };

// /* 📚 Get style context for target language */
// const getStyleContextForTarget = async (lang) => {
//   if (lang === "hindi") return await getHindiStyleContext();
//   if (lang === "bangla") return await getBanglaStyleContext();
//   if (lang === "english") return await getEnglishStyleContext();
//   return [];
// };

// /* 📝 OpenAI schema */
// const articleSchema = {
//   name: "generateLocalizedArticle",
//   description: "Generate localized BOOM article",
//   parameters: {
//     type: "object",
//     properties: {
//       heading: { type: "string" },
//       description: { type: "string" },
//       story: { type: "string" },
//       tags: { type: "string" },
//       claim_review: { type: "string" },
//       keywords: { type: "string" }
//     },
//     required: ["heading", "description", "story", "tags", "claim_review", "keywords"]
//   }
// };

// /* ✨ Convert between languages */
// const convertArticle = async (sourceArticle, targetLanguage) => {
//   const styleCtx = await getStyleContextForTarget(targetLanguage);
//   const contextString = styleCtx.map((c, i) =>
//     `Example ${i + 1}:\nHeading: ${c.heading}\nDescription: ${c.description}\nStory: ${c.storyExcerpt}`
//   ).join("\n\n");

//   const { processedContent, embedPlaceholders } = preserveEmbeds(sourceArticle.story || "");

//   const prompt = `
// You are translating a BOOM Live fact-check to ${targetLanguage.toUpperCase()}.

// CRITICAL:
// - Keep {{EMBED_PLACEHOLDER_X}} in place.
// - Preserve HTML structure.

// Style Guide:
// ${STYLE_GUIDELINES[targetLanguage]}

// Examples:
// ${contextString}

// Source:
// Heading: ${sourceArticle.heading}
// Description: ${sourceArticle.description}
// Story: ${processedContent}
// Tags: ${sourceArticle.tags}
// Claim Review: ${sourceArticle.claim_review}
// Keywords: ${sourceArticle.keywords}
// `;

//   const resp = await openai.chat.completions.create({
//     model: "gpt-4.1-mini",
//     messages: [{ role: "user", content: prompt }],
//     functions: [articleSchema],
//     function_call: { name: "generateLocalizedArticle" }
//   });

//   const args = JSON.parse(resp.choices[0].message.function_call.arguments);
//   args.story = restoreEmbeds(args.story, embedPlaceholders);
//   return args;
// };

// /* 🚀 Main Express handler */
// const translateBoomArticle = async (req, res) => {
//   const { newsId, newsUrl, sourceLanguage, targetLanguage } = req.body;
//   const srcLang = (sourceLanguage || "").toLowerCase();
//   const tgtLang = (targetLanguage || "").toLowerCase();

//   if (!["english", "hindi", "bangla"].includes(tgtLang))
//     return res.status(400).json({ error: "Invalid targetLanguage" });

//   try {
//     let sourceArticle;
//     if (newsUrl) {
//       const detectedSrc = srcLang || (
//         newsUrl.includes("hindi.") ? "hindi" :
//         newsUrl.includes("bangla.") ? "bangla" : "english"
//       );
//       sourceArticle = await fetchBoomArticleByUrl(newsUrl, detectedSrc);
//     } else if (newsId) {
//       if (!srcLang) return res.status(400).json({ error: "sourceLanguage required for ID" });
//       sourceArticle = await fetchBoomArticle(newsId, srcLang);
//     } else {
//       return res.status(400).json({ error: "newsUrl or newsId required" });
//     }

//     const localized = await convertArticle(sourceArticle, tgtLang);
//     const translated = {
//       ...sourceArticle,
//       ...localized,
//       language: tgtLang,
//       translated_from: sourceArticle.newsId,
//       translation_timestamp: new Date().toISOString()
//     };

//     return res.json({ success: true, data: { news: [translated] } });
//   } catch (e) {
//     return res.status(500).json({ success: false, error: e.message });
//   }
// };

// module.exports = { translateBoomArticle };



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
    "https://bangla.boomlive.in/fact-check/viral-video-boyfriend-beating-girlfriend-muslim-hindu-false-communal-claim-scripted-video-fact-check-29223",
    "https://bangla.boomlive.in/fact-check/muslim-passenger-slapped-in-indigo-mumbai-kolkata-flight-hindu-false-communal-claim-viral-video-fact-check-29208",
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

/* 📝 Enhanced Style guidelines */
const STYLE_GUIDELINES = {
  hindi: `
- औपचारिक लेकिन सुलभ भाषा
- "बूम ने अपनी जांच में पाया..." जैसे वाक्य
- क्लेम और फैक्ट चेक अलग रखें
- HTML और embeds जस के तस रखें`,
  bangla: `
- প্রাকৃতিক বাংলা ভাষার প্রবাহ বজায় রাখুন
- "বুমের যাচাইয়ে দেখা যায়..." বা "বুম তার অনুসন্ধানে জানতে পারে..." ব্যবহার করুন
- সঠিক বাংলা ব্যাকরণ ও বাক্য গঠন অনুসরণ করুন
- যৌগিক ক্রিয়া সঠিকভাবে ব্যবহার করুন (যেমন: "ব্যবহার করা হয়েছে", "দেখা যায়")
- বিশেষ্য-বিশেষণের সঠিক ক্রম বজায় রাখুন
- "দাবি" ও "তথ্য যাচাই" অংশ স্পষ্টভাবে আলাদা রাখুন
- HTML ও embeds অপরিবর্তিত রাখুন
- প্রতিটি বাক্যে স্বাভাবিক বাংলা ভাষার ছন্দ বজায় রাখুন`,
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

/* 🔍 Quality check for Bangla translations */
const qualityCheckBangla = (translatedText) => {
  const fixes = [
    // Fix compound verb structures
    { pattern: /একটি ([^\s]+) ব্যবহার$/g, replacement: 'একটি $1 ব্যবহার করা হয়েছে' },
    { pattern: /দেখে বোঝা যায় এটি একটি/g, replacement: 'দেখে বোঝা যায় এটিতে একটি' },
    // Fix article usage
    { pattern: /এটি একটি ([^\s]+) মহিলা/g, replacement: 'এটি একজন $1 মহিলার' },
    { pattern: /একটি ([^\s]+) মহিলা/g, replacement: 'একজন $1 মহিলার' },
    // Fix verb endings
    { pattern: /ফিল্টার ব্যবহার$/g, replacement: 'ফিল্টার ব্যবহার করা হয়েছে' },
    { pattern: /চিহ্নসহ ভিডিও পাওয়া গেছে/g, replacement: 'চিহ্নযুক্ত ভিডিও পাওয়া যায়' },
  ];
  
  let result = translatedText;
  fixes.forEach(fix => {
    result = result.replace(fix.pattern, fix.replacement);
  });
  
  return result;
};

/* 🎯 Bangla-specific prompt generator */
const getBanglaSpecificPrompt = (sourceArticle, processedContent, contextString) => `
You are a professional Bengali translator specializing in fact-check journalism for BOOM Live.

CRITICAL TRANSLATION RULES:
- Write in natural, fluent Bengali - avoid mechanical word-for-word translation
- Use proper Bengali grammar and sentence structure
- Keep {{EMBED_PLACEHOLDER_X}} placeholders exactly as they are
- Preserve all HTML tags and structure

SPECIFIC BENGALI LANGUAGE REQUIREMENTS:
- Use compound verbs correctly (করা হয়েছে, দেখা যায়, পাওয়া যায়)
- Maintain proper noun-adjective order in Bengali
- Use appropriate Bengali journalism terminology
- Ensure sentence flow sounds natural when read aloud
- Use "বুমের যাচাইয়ে জানা যায়" or "বুম তার অনুসন্ধানে দেখে" style phrases

EXAMPLES OF GOOD VS BAD BENGALI:
❌ Bad: "ব্যবহারকারীরা দাবি করছেন এটি একটি হিন্দু মহিলা"
✅ Good: "ব্যবহারকারীরা দাবি করছেন ছবিটি একজন হিন্দু মহিলার"

❌ Bad: "এটি একটি ফিল্টার ব্যবহার"
✅ Good: "এটিতে একটি ফিল্টার ব্যবহার করা হয়েছে"

❌ Bad: "চিহ্নসহ ভিডিও পাওয়া গেছে যেখানে দেখা যায় সে ঘরোয়া হিংসাকে প্রেমের নাম দিয়ে যুক্তি করার মেয়েদের প্রশ্ন করছে"
✅ Good: "পুন্ডীরের ইউটিউব চ্যানেল ও ফেসবুকে কয়েকটি ভিডিওয় তার মুখে ছবির মতো ক্ষত চিহ্ন দৃশ্যমান। ভিডিওগুলিতে যেসব মহিলারা প্রেমের দোহাই দিয়ে গার্হস্থ্য নির্যাতনকে মেনে নেন তাদের প্রশ্ন করতে দেখা যায় পুন্ডীরকে।"

Style Examples from BOOM Bangla:
${contextString}

Source Article to Translate:
Heading: ${sourceArticle.heading}
Description: ${sourceArticle.description}
Story: ${processedContent}
Tags: ${sourceArticle.tags}
Claim Review: ${sourceArticle.claim_review}
Keywords: ${sourceArticle.keywords}

Translate maintaining journalistic integrity and natural Bengali flow.
`;

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

/* ✨ Enhanced Convert between languages */
const convertArticle = async (sourceArticle, targetLanguage) => {
  const styleCtx = await getStyleContextForTarget(targetLanguage);
  const contextString = styleCtx.map((c, i) =>
    `Example ${i + 1}:\nHeading: ${c.heading}\nDescription: ${c.description}\nStory: ${c.storyExcerpt}`
  ).join("\n\n");

  const { processedContent, embedPlaceholders } = preserveEmbeds(sourceArticle.story || "");

  let prompt;
  let systemMessage;

  if (targetLanguage === 'bangla') {
    prompt = getBanglaSpecificPrompt(sourceArticle, processedContent, contextString);
    systemMessage = "You are an expert Bengali translator and journalist. Focus on natural Bengali expression, proper grammar, and maintaining journalistic tone. Avoid mechanical word-for-word translation.";
  } else {
    // Original prompt for other languages
    prompt = `
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
    systemMessage = "You are a professional translator for fact-check journalism.";
  }

  const resp = await openai.chat.completions.create({
    model: "gpt-4o", // Upgraded model for better language understanding
    messages: [
      {
        role: "system",
        content: systemMessage
      },
      { role: "user", content: prompt }
    ],
    functions: [articleSchema],
    function_call: { name: "generateLocalizedArticle" },
    temperature: 0.3 // Lower temperature for more consistent translations
  });

  const args = JSON.parse(resp.choices[0].message.function_call.arguments);
  
  // Apply quality check for Bangla
  if (targetLanguage === 'bangla') {
    args.heading = qualityCheckBangla(args.heading);
    args.description = qualityCheckBangla(args.description);
    args.story = qualityCheckBangla(args.story);
    args.claim_review = qualityCheckBangla(args.claim_review);
  }
  
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
    console.error('Translation error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = { translateBoomArticle };
