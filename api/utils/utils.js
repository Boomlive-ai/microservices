const { OpenAI } = require("openai"); // Import OpenAI
const axios = require("axios");
const { load } = require("cheerio");

require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});

const extractArticleData = async (url) => {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = load(htmlContent);

    // Extract title and meta description (important for SEO)
    const title = $("title").text() || "";
    const metaDescription = $("meta[name='description']").attr("content") || "";
    
    // Extract all headers for SEO analysis (H1, H2, H3, etc.)
    let headers = [];
    $("h1, h2, h3, h4, h5, h6").each((index, element) => {
      headers.push($(element).text().trim());
    });

    // Extract the article content. First try to get content from <article> and its paragraphs.
    let articleText = "";
    $("article p").each((index, element) => {
      articleText += $(element).text() + "\n";
    });

    // If no article content found, fallback to <p> tags from the entire document
    if (!articleText) {
      $("p").each((index, element) => {
        articleText += $(element).text() + "\n";
      });
    }

    // Extract internal links
    let internalLinks = [];
    $("a").each((index, element) => {
      const link = $(element).attr("href");
      if (link && link.startsWith("/")) {  // Internal links usually start with '/'
        internalLinks.push(link);
      }
    });

    // Clean up the articleText (optional: normalize whitespace, remove non-relevant text, etc.)
    articleText = articleText.trim().replace(/\s+/g, ' '); // Normalize spaces

    // Return the cleaned article text and additional SEO-related data
    return {
      articleText: articleText,  // Cleaned text for content analysis
      title: title,              // Page title for meta analysis
      metaDescription: metaDescription,  // Meta description for SEO analysis
      headers: headers,          // List of headers (important for SEO)
      internalLinks: internalLinks // List of internal links
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("Error fetching article content");
  }
};


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
      console.log(articleText);
      
      return articleText.trim();
    } catch (error) {
      console.error("Error fetching article:", error);
      throw new Error("Error fetching article content");
    }
  };



  
module.exports = {
    fetchArticleContent,
    openai,
    extractArticleData
  };
  