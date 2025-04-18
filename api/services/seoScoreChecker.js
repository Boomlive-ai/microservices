const { openai, extractArticleData } = require("../utils/utils"); // Import the summarizeNews function

// const seoScoreChecker = async (articleText, focusKeywords, articleData) => {
//   try {
//     // Ensure focusKeywords is always an array
//     const focusKeywordsArray =
//       typeof focusKeywords === "string" ? [focusKeywords] : focusKeywords || [];

//     const wordCount = articleText.split(" ").length;
//     console.log(`wordcount: ${wordCount}`);

//     const titleLength = articleData.title.length; // Title length from articleData
//     const metaDescriptionLength = articleData.metaDescription.length; // Meta description length from articleData

//     // Header analysis with flexible regex and logging
//     console.log("Headers from article data:", articleData.headers);
//     const headerAnalysis = (articleData.headers || []).reduce(
//       (acc, header, index) => {
//         let level = "h3"; // Default to H3 for unclassified headers
//         if (index === 0) level = "h1";
//         else if (index <= 3) level = "h2";

//         acc[level] = acc[level] || [];
//         acc[level].push(header);
//         return acc;
//       },
//       {}
//     );

//     // console.log("Header analysis:", headerAnalysis);

//     // Keyword density calculation
//     const keywordDensity = focusKeywordsArray.reduce((acc, keyword) => {
//       if (!articleText) {
//         console.error("Error: articleText is undefined or empty.");
//         return acc;
//       }

//       const keywordCount = (
//         articleText.match(new RegExp(`\\b${keyword}\\b`, "gi")) || []
//       ).length;
//       acc[keyword] =
//         wordCount > 0
//           ? `${((keywordCount / wordCount) * 100).toFixed(2)}%`
//           : "0%";

//       return acc;
//     }, {});

//     // Meta description optimization check
//     const metaDescriptionContent = articleData.metaDescription;
//     const isMetaDescriptionOptimized = focusKeywordsArray.some((keyword) =>
//       metaDescriptionContent.includes(keyword)
//     );

//     // Internal links check (if any)
//     const internalLinks = articleData.internalLinks || [];

//     // Image SEO Analysis
//     const images = articleData.images || [];
//     const totalImages = images.length;
//     const imagesWithAlt = images.filter(
//       (img) => img.alt && img.alt.trim() !== ""
//     ).length;
//     const imagesWithTitle = images.filter(
//       (img) => img.title && img.title.trim() !== ""
//     ).length;
//     const keywordOptimizedImages = images.filter((img) =>
//       focusKeywordsArray.some((keyword) => img.alt?.includes(keyword))
//     ).length;
//     const altTextCoverage =
//       totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;
//     const keywordOptimizedAlt =
//       totalImages > 0 ? (keywordOptimizedImages / totalImages) * 100 : 0;

//     // Log the original values of the variables
//     // console.log("Original Values:");
//     // console.log("altTextCoverage:", altTextCoverage);
//     // console.log("keywordOptimizedAlt:", keywordOptimizedAlt);
//     // console.log("imagesWithTitle:", imagesWithTitle);
//     // console.log("totalImages:", totalImages);

//     // Validate and calculate
//     const validatedAltTextCoverage = isNaN(altTextCoverage)
//       ? 0
//       : altTextCoverage;
//     const validatedKeywordOptimizedAlt = isNaN(keywordOptimizedAlt)
//       ? 0
//       : keywordOptimizedAlt;
//     const validatedImagesWithTitle = isNaN(imagesWithTitle)
//       ? 0
//       : imagesWithTitle;
//     const validatedTotalImages =
//       isNaN(totalImages) || totalImages === 0 ? 1 : totalImages; // Avoid division by zero

//     // Log the validated values
//     // console.log("Validated Values:");
//     // console.log("validatedAltTextCoverage:", validatedAltTextCoverage);
//     // console.log("validatedKeywordOptimizedAlt:", validatedKeywordOptimizedAlt);
//     // console.log("validatedImagesWithTitle:", validatedImagesWithTitle);
//     // console.log("validatedTotalImages:", validatedTotalImages);

//     // Calculate imageSEOScore
//     const imageSEOScore =
//       validatedAltTextCoverage * 0.4 +
//       validatedKeywordOptimizedAlt * 0.3 +
//       (validatedImagesWithTitle / validatedTotalImages) * 0.3;

//     // Log the calculated score
//     // console.log("Calculated imageSEOScore:", imageSEOScore);

//     // In case imageSEOScore is NaN, log it as well
//     if (isNaN(imageSEOScore)) {
//       console.log("imageSEOScore is NaN. Setting to 0.");
//       imageSEOScore = 0; // Ensure it's valid
//     }

//     // Final result
//     const imageSEOScoreFormatted = imageSEOScore.toFixed(2);
//     // console.log(
//     //   "Formatted imageSEOScore (2 decimal places):",
//     //   imageSEOScoreFormatted
//     // );

//     // Example prompt using the `articleData` for a detailed SEO analysis
//     const prompt = `Analyze the following content for SEO performance. Consider keyword usage, readability, title and meta description, header structure, internal linking, and overall content quality. Focus keywords: ${focusKeywordsArray.join(
//       ", "
//     )}.
    
//       Content: ${articleText}
    
//       Title Length: ${titleLength}
//       Meta Description Length: ${metaDescriptionLength}
//       Headers: ${headerAnalysis.h1 ? headerAnalysis.h1.join(", ") : ""}, ${
//       headerAnalysis.h2 ? headerAnalysis.h2.join(", ") : ""
//     }, ${headerAnalysis.h3 ? headerAnalysis.h3.join(", ") : ""}
//       Internal Links: ${internalLinks.length}
//       Meta Description Optimized: ${isMetaDescriptionOptimized ? "Yes" : "No"}
//       Keyword Density: ${keywordDensity}

//       Return a JSON response with these fields:
//       - keywordDensity (percentage for each focus keyword) eg:- ${keywordDensity}
//       - readabilityScore (0-100 scale)
//       - headerAnalysis (list of H1, H2, etc.)
//       - metaAnalysis (title length, meta description length)
//       - contentQualityScore (0-100 scale based on relevance and originality)
//       - overallSEOScore (aggregated score based on all parameters).
//       - overallSEOAnalysis (mention points analyzed and improvements needed)
    
//        Image SEO:
//       - Total Images: ${totalImages}
//       - Images with Alt: ${imagesWithAlt} (${altTextCoverage.toFixed(2)}%)
//       - Images with Titles: ${imagesWithTitle}
//       - Images with Keyword-Optimized Alt: ${keywordOptimizedImages} (${keywordOptimizedAlt.toFixed(
//       2
//     )}%)
//       - Image SEO Score: ${imageSEOScore.toFixed(2)}
      
//       Example of default json format on generating response:
    
//       {
//         "keywordDensity": { "keyword1": X%, "keyword2": X% },  // Percentage of each keyword's usage in % and pass it as a string
//         "readabilityScore": 0-100,  // Readability score
//         "headerAnalysis": {
//             "h1": {
//               "headers": ["Header 1 Example"],
//               "explanation": "The H1 tag is used correctly for the main title of the article. It clearly defines the primary topic of the article, which is important for both SEO and user experience."
//             },
//             "h2": {
//               "headers": ["Subheader 1 Example", "Subheader 2 Example"],
//               "explanation": "H2 tags are used for major sections that break down the content logically. These sections help organize the content and make it easier for both users and search engines to navigate."
//             },
//             "h3": {
//               "headers": ["Sub-subheader 1 Example"],
//               "explanation": "H3 tags are used for further sub-sections, which are useful for organizing more detailed information within each section. However, there are too many H3 tags, and they could be reduced for a clearer structure."
//             }
//           },
//           "metaAnalysis": { 
//             "titleLength": ${titleLength},  // Length of title tag
//             "metaDescriptionLength": ${metaDescriptionLength},  // Length of meta description
//             "metaDescriptionOptimized": "${
//               isMetaDescriptionOptimized ? "Yes" : "No"
//             }",
//           },
//           "imageSEO": {
//             "totalImages": ${totalImages},
//             "imagesWithAlt": ${imagesWithAlt},
//             "altTextCoverage": "${altTextCoverage.toFixed(2)}%",
//             "keywordOptimizedAlt": "${keywordOptimizedAlt.toFixed(2)}%",
//             "imagesWithTitle": ${imagesWithTitle},
//             "imageSEOScore": ${imageSEOScore.toFixed(2)},
//             "imageSEOScoreExplanation": "Provide why it got image SEO Score and Improvements needed"
//             "ImprovementsExample": "Generate Examples of most improved alt and title for best seo score possible in this format: ["Previous ALT & Title":[${images[0].alt}, ${images[0].title}], alt": "", "title": ""}]"
//           }
//         },
//         "contentQualityScore": 0-100,  // Score based on content quality
//         "overallSEOScore": 0-100,  // Aggregated SEO score
//         "overallSEOAnalysis": { 
//           "keywordUsage": "Your analysis of keyword usage", 
//           "readability": "Your readability analysis", 
//           "titleAndMetaDescription": "Your analysis of title and meta description",
//           "headerStructure": "Your analysis of header structure",
//           "internalLinking": "Your analysis of internal linking",
//           "contentQuality": "Your analysis of content quality",
//           "improvementsNeeded": [{"Improvements Needed": "Your suggestions for improvements","Examples": "Example of improved content like description, title mentioned in improvement needed"}, ......n],
//           "overallScoreExplanation": "Explanation of how the overall SEO score was calculated and why the score is high/low."
//         }
//       }
  
//       The response should be strictly in json format only as per all parameters required
//       `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o", // or use "gpt-3.5-turbo" for a faster, cost-effective option
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert in providing and analyzing SEO-optimized content scores.",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       max_tokens: 4096, // Adjust based on desired summary length
//       temperature: 0.5, // Set to 0 for a more deterministic response
//     });

//     const responseText = response.choices[0].message.content.trim();
//     const cleanedText = responseText.replace(/```json\n|\n```/g, "");

//     console.log(cleanedText);

//     return JSON.parse(cleanedText);
//   } catch (error) {
//     console.error("Please provide the URL of a fact-check article. There was an error while analyzing the content.", error);
//     throw new Error("Please provide the URL of a fact-check article. There was an error while analyzing the content.");
//   }
// };

// const seoablityRes = async (req, res) => {
//   const { url, text, focusKeywords } = req.body; // Expecting URL and text in the request body

//   // Check if both URL and text are empty
//   if (!url && !text) {
//     return res.status(400).json({ error: "Either URL or text is required" });
//   }

//   try {
//     let articleText;
//     let articleData;

//     // If text is provided, use it directly
//     if (text) {
//       articleText = text;
//       articleData = { articleText: text }; // Passing only text in case no URL is provided
//     }
//     // If URL is provided, fetch the article content
//     else if (url) {
//       articleData = await extractArticleData(url);
//       articleText = articleData.articleText; // Extracted article text from the URL
//     }
//     // Summarize the article text using the Google Generative AI
//     const summary = await seoScoreChecker(
//       articleText,
//       focusKeywords,
//       articleData
//     );

//     console.log(summary);

//     res.status(200).json({ response: summary }); // Send back the sentiment analysis
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




const seoScoreChecker = async (articleText, focusKeywords, articleData) => {
  try {
    // Ensure focusKeywords is always an array
    const focusKeywordsArray =
      typeof focusKeywords === "string" ? [focusKeywords] : focusKeywords || [];

    const wordCount = articleText.split(/\s+/).length;
    console.log(`Word count: ${wordCount}`);

    const titleLength = articleData.title.length;
    const metaDescriptionLength = articleData.metaDescription.length;

    // Improved header analysis
    const headerAnalysis = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };
    
    articleData.headers.forEach(header => {
      if (headerAnalysis[header.level]) {
        headerAnalysis[header.level].push(header.text);
      }
    });

    // Check for presence of H1 (SEO best practice is to have exactly one H1)
    const h1Count = headerAnalysis.h1.length;
    const hasProperH1 = h1Count === 1;

    // Keyword density calculation
    const keywordDensity = focusKeywordsArray.reduce((acc, keyword) => {
      if (!articleText || typeof articleText !== 'string') {
        console.error("Error: articleText is undefined, empty, or not a string.");
        return acc;
      }

      const keywordRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      const keywordCount = (articleText.match(keywordRegex) || []).length;
      acc[keyword] = wordCount > 0
        ? `${((keywordCount / wordCount) * 100).toFixed(2)}%`
        : "0%";

      return acc;
    }, {});

    // Title SEO check
    const hasFocusKeywordInTitle = focusKeywordsArray.some(keyword => 
      articleData.title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const isTitleOptimalLength = titleLength >= 40 && titleLength <= 60;

    // Meta description optimization check
    const metaDescriptionContent = articleData.metaDescription;
    const isMetaDescriptionOptimized = focusKeywordsArray.some(keyword => 
      metaDescriptionContent.toLowerCase().includes(keyword.toLowerCase())
    );
    const isMetaDescriptionOptimalLength = metaDescriptionLength >= 120 && metaDescriptionLength <= 160;

    // Internal and external links analysis
    const internalLinksCount = articleData.links.internal.length;
    const externalLinksCount = articleData.links.external.length;
    const totalLinks = articleData.links.total;

    // Image SEO Analysis
    const images = articleData.images || [];
    const totalImages = images.length;
    const imagesWithAlt = images.filter(img => img.hasAlt).length;
    const imagesWithTitle = images.filter(img => img.hasTitle).length;
    const keywordOptimizedImages = images.filter(img => 
      focusKeywordsArray.some(keyword => 
        img.alt?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).length;
    
    // Calculate image SEO metrics safely
    const altTextCoverage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 0;
    const keywordOptimizedAlt = totalImages > 0 ? (keywordOptimizedImages / totalImages) * 100 : 0;
    const titleCoverage = totalImages > 0 ? (imagesWithTitle / totalImages) * 100 : 0;

    // Calculate Image SEO Score
    const imageSEOScore = (
      (altTextCoverage * 0.4) + 
      (keywordOptimizedAlt * 0.4) + 
      (titleCoverage * 0.2)
    ) / 100 * 100;  // Scale to 0-100

    // Generate example prompt for OpenAI
    const prompt = `Analyze the following content for SEO performance. Consider keyword usage, readability, title and meta description, header structure, internal linking, and overall content quality. Focus keywords: ${focusKeywordsArray.join(
      ", "
    )}.
    
    Content: ${articleText.substring(0, 5000)}... (truncated for API limit)
    
    URL: ${articleData.url || "Not provided"}
    Title: ${articleData.title}
    Title Length: ${titleLength} characters (Optimal: 40-60)
    Keywords in Title: ${hasFocusKeywordInTitle ? "Yes" : "No"}
    
    Meta Description: ${articleData.metaDescription}
    Meta Description Length: ${metaDescriptionLength} characters (Optimal: 120-160)
    Keywords in Meta Description: ${isMetaDescriptionOptimized ? "Yes" : "No"}
    
    Word Count: ${wordCount} words
    
    Header Structure:
    - H1 Tags (${headerAnalysis.h1.length}): ${headerAnalysis.h1.join(", ")}
    - H2 Tags (${headerAnalysis.h2.length}): ${headerAnalysis.h2.join(", ")}
    - H3 Tags (${headerAnalysis.h3.length}): ${headerAnalysis.h3.length > 5 ? headerAnalysis.h3.slice(0, 5).join(", ") + "..." : headerAnalysis.h3.join(", ")}
    
    Links:
    - Total Links: ${totalLinks}
    - Internal Links: ${internalLinksCount}
    - External Links: ${externalLinksCount}
    
    Keyword Density: ${JSON.stringify(keywordDensity)}
    
    Image SEO:
    - Total Images: ${totalImages}
    - Images with Alt Text: ${imagesWithAlt} (${altTextCoverage.toFixed(2)}%)
    - Images with Title: ${imagesWithTitle} (${titleCoverage.toFixed(2)}%)
    - Images with Keyword-Optimized Alt: ${keywordOptimizedImages} (${keywordOptimizedAlt.toFixed(2)}%)
    - Image SEO Score: ${imageSEOScore.toFixed(2)}
    
    Return a JSON response with these fields:
    {
      "keywordDensity": { "keyword1": "X%", "keyword2": "X%" },
      "readabilityScore": 0-100,
      "headerAnalysis": {
        "h1": {
          "headers": ["Header 1 Example"],
          "explanation": "Analysis of H1 usage"
        },
        "h2": {
          "headers": ["Subheader 1 Example", "Subheader 2 Example"],
          "explanation": "Analysis of H2 usage"
        },
        "h3": {
          "headers": ["Sub-subheader 1 Example"],
          "explanation": "Analysis of H3 usage"
        }
      },
      "metaAnalysis": { 
        "titleLength": ${titleLength},
        "titleOptimized": "${hasFocusKeywordInTitle ? "Yes" : "No"}",
        "titleOptimalLength": "${isTitleOptimalLength ? "Yes" : "No"}",
        "metaDescriptionLength": ${metaDescriptionLength},
        "metaDescriptionOptimized": "${isMetaDescriptionOptimized ? "Yes" : "No"}",
        "metaDescriptionOptimalLength": "${isMetaDescriptionOptimalLength ? "Yes" : "No"}"
      },
      "linksAnalysis": {
        "totalLinks": ${totalLinks},
        "internalLinks": ${internalLinksCount},
        "externalLinks": ${externalLinksCount},
        "linkDensity": "${totalLinks > 0 ? (totalLinks / wordCount * 1000).toFixed(2) : 0} links per 1000 words",
        "analysis": "Your analysis of link structure"
      },
      "imageSEO": {
        "totalImages": ${totalImages},
        "imagesWithAlt": ${imagesWithAlt},
        "altTextCoverage": "${altTextCoverage.toFixed(2)}%",
        "keywordOptimizedAlt": "${keywordOptimizedAlt.toFixed(2)}%",
        "imagesWithTitle": ${imagesWithTitle},
        "imageSEOScore": ${imageSEOScore.toFixed(2)},
        "imageSEOScoreExplanation": "Explanation of image SEO score",
        "improvementsNeeded": "Suggestions for improving image SEO"
      },
      "contentQualityScore": 0-100,
      "overallSEOScore": 0-100,
      "overallSEOAnalysis": { 
        "keywordUsage": "Analysis of keyword usage", 
        "readability": "Readability analysis", 
        "titleAndMetaDescription": "Analysis of title and meta description",
        "headerStructure": "Analysis of header structure",
        "internalLinking": "Analysis of internal linking",
        "contentQuality": "Analysis of content quality",
        "improvementsNeeded": [
          {"improvement": "Description of improvement needed", "example": "Example of improved content"}
        ],
        "overallScoreExplanation": "Explanation of overall SEO score"
      }
    }
    
    The response must be strictly in JSON format.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in providing and analyzing SEO-optimized content scores."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4096,
      temperature: 0.5,
    });

    const responseText = response.choices[0].message.content.trim();
    const cleanedText = responseText.replace(/```json\n|\n```/g, "");

    console.log("OpenAI response processed");

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error in SEO analysis:", error);
    throw new Error(`Error analyzing content for SEO: ${error.message}`);
  }
};





const seoablityRes = async (req, res) => {
  const { url, text, focusKeywords } = req.body;

  // Check if both URL and text are empty
  if (!url && !text) {
    return res.status(400).json({ error: "Either URL or text is required" });
  }

  try {
    let articleText;
    let articleData;

    // If text is provided, use it directly
    if (text) {
      articleText = text;
      articleData = { 
        articleText: text,
        title: req.body.title || "No title provided",
        metaDescription: req.body.metaDescription || "",
        headers: req.body.headers || [],
        internalLinks: [],
        images: []
      };
    }
    // If URL is provided, fetch the article content
    else if (url) {
      articleData = await extractArticleData(url);
      articleText = articleData.articleText;
    }

    // Perform SEO analysis
    const seoAnalysis = await seoScoreChecker(
      articleText,
      focusKeywords,
      articleData
    );

    res.status(200).json({ 
      response: seoAnalysis,
      analysisDate: new Date().toISOString(),
      url: url || "Direct text analysis",
      focusKeywords
    });
  } catch (error) {
    console.error("SEO Analysis Error:", error);
    res.status(500).json({ 
      error: error.message,
      details: "There was an error analyzing the content for SEO." 
    });
  }
};



module.exports = {
  seoablityRes,
};
