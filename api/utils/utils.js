const { OpenAI } = require("openai"); // Import OpenAI
const axios = require("axios");
const { load } = require("cheerio");
const wiki = require('wikipedia');

require("dotenv").config();

const openai = new OpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  apiKey: process.env.OPENAI_API_KEY, // Use the API key from the .env file
});


/**
 * Fetches the summary of a Wikipedia article.
 * @param {string} title - The title of the Wikipedia page.
 * @returns {Promise<string>} - The summary of the page or a fallback message.
 */
const getWikipediaSummary = async (title) => {
  try {
    const summary = await wiki.summary(title); // Fetch the summary for the page
    console.log(summary.content_urls.desktop.page);
    
    return summary.extract; // Returns the summary extract
  } catch (error) {
    if (error.message.includes('404')) {
      console.error("Wikipedia page not found for title:", title);
      return `No Wikipedia page found for "${title}".`; // Return a user-friendly message
    }
    console.error("Error fetching summary:", error);
    return `Error fetching summary for "${title}".`; // Return error message
  }
};

/**
 * Fetches the link to a Wikipedia article.
 * @param {string} title - The title of the Wikipedia page.
 * @returns {Promise<string>} - The link to the Wikipedia article.
 */
const getWikipediaLink = async (title) => {
  try {
    const page = await wiki.summary(title); // Fetch the page object
    return page.content_urls.desktop.page; // Returns the URL of the page
  } catch (error) {
    console.error("Error fetching article link:", error);
    return null;
  }
};

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

    // Extract image alt text and title attributes
    let images = [];
    $(".article-container img").each((index, element) => {
      // Use 'data-src' if it exists, otherwise fall back to 'src'
      const src = $(element).attr("data-src") || $(element).attr("src") || "";
      const alt = $(element).attr("alt") || "No alt text";
      const imgTitle = $(element).attr("title") || "No title";
      
      images.push({ src, alt, title: imgTitle });
    });
    
    console.log(images);

    // Clean up the articleText (optional: normalize whitespace, remove non-relevant text, etc.)
    articleText = articleText.trim().replace(/\s+/g, ' '); // Normalize spaces
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
    console.log(images);
    
    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

    // Return the cleaned article text and additional SEO-related data
    return {
      articleText,       // Cleaned text for content analysis
      title,             // Page title for meta analysis
      metaDescription,   // Meta description for SEO analysis
      headers,           // List of headers (important for SEO)
      internalLinks,     // List of internal links
      images             // List of images with src, alt text, and title
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("Error fetching article content");
  }
};

// const extractArticleData = async (url) => {
//   try {
//     const response = await axios.get(url);
//     const htmlContent = response.data;
//     const $ = load(htmlContent);

//     // Extract title and meta description (important for SEO)
//     const title = $("title").text() || "";
//     const metaDescription = $("meta[name='description']").attr("content") || "";
    
//     // Extract Open Graph and Twitter metadata (important for social sharing)
//     const ogTitle = $("meta[property='og:title']").attr("content") || "";
//     const ogDescription = $("meta[property='og:description']").attr("content") || "";
//     const twitterTitle = $("meta[name='twitter:title']").attr("content") || "";
//     const twitterDescription = $("meta[name='twitter:description']").attr("content") || "";

//     // Extract all headers for SEO analysis (H1, H2, H3, etc.)
//     let headers = [];
//     $("h1, h2, h3, h4, h5, h6").each((index, element) => {
//       headers.push({
//         level: element.name, // This will capture h1, h2, etc.
//         text: $(element).text().trim()
//       });
//     });

//     // More robust content extraction strategy - try multiple common content containers
//     const possibleContentSelectors = [
//       "article", "main", ".content", ".post-content", ".entry-content", 
//       "#content", "[role='main']", ".main-content", ".post", "#main"
//     ];
    
//     let articleText = "";
//     let contentSelector = "";
    
//     // Try each selector until we find one with content
//     for (const selector of possibleContentSelectors) {
//       const content = $(selector).text().trim();
//       if (content && content.length > articleText.length) {
//         articleText = content;
//         contentSelector = selector;
//       }
//     }
    
//     // If still no content, fall back to all paragraphs in the body
//     if (!articleText) {
//       $("body p").each((index, element) => {
//         articleText += $(element).text() + "\n";
//       });
//     }

//     // Extract all links from the page
//     let allLinks = [];
//     let internalLinks = [];
//     let externalLinks = [];
    
//     $("a").each((index, element) => {
//       const link = $(element).attr("href");
//       const linkText = $(element).text().trim();
      
//       if (!link) return;
      
//       const linkObj = { url: link, text: linkText };
//       allLinks.push(linkObj);
      
//       // Determine if internal or external
//       try {
//         const linkUrl = new URL(link, url);
//         const pageUrl = new URL(url);
        
//         if (linkUrl.hostname === pageUrl.hostname) {
//           internalLinks.push(linkObj);
//         } else {
//           externalLinks.push(linkObj);
//         }
//       } catch (e) {
//         // Likely a relative URL, so it's internal
//         internalLinks.push(linkObj);
//       }
//     });

//     // Extract all images from the page (not limited to specific containers)
//     let images = [];
//     $("img").each((index, element) => {
//       // Use multiple possible image source attributes
//       const src = $(element).attr("data-src") || 
//                  $(element).attr("data-lazy-src") || 
//                  $(element).attr("src") || 
//                  "";
                 
//       const alt = $(element).attr("alt") || "";
//       const imgTitle = $(element).attr("title") || "";
//       const width = $(element).attr("width") || "";
//       const height = $(element).attr("height") || "";
      
//       // Only add images with actual sources
//       if (src) {
//         images.push({ 
//           src, 
//           alt, 
//           title: imgTitle,
//           width,
//           height,
//           hasAlt: alt && alt.trim() !== "",
//           hasTitle: imgTitle && imgTitle.trim() !== ""
//         });
//       }
//     });

//     // Extract schema.org structured data if present
//     let structuredData = [];
//     $('script[type="application/ld+json"]').each((index, element) => {
//       try {
//         const data = JSON.parse($(element).html());
//         structuredData.push(data);
//       } catch (e) {
//         console.log("Error parsing structured data:", e);
//       }
//     });

//     // Clean up the articleText
//     articleText = articleText.trim().replace(/\s+/g, ' ');
    
//     // Calculate word count
//     const wordCount = articleText.split(/\s+/).length;
    
//     return {
//       articleText,
//       title,
//       metaDescription,
//       socialMetadata: {
//         ogTitle,
//         ogDescription,
//         twitterTitle,
//         twitterDescription
//       },
//       headers,
//       links: {
//         total: allLinks.length,
//         internal: internalLinks,
//         external: externalLinks
//       },
//       images,
//       structuredData,
//       wordCount,
//       contentSelector: contentSelector || "body p", // Which selector was used for content
//       url // Original URL
//     };
//   } catch (error) {
//     console.error("Error fetching article:", error);
//     throw new Error(`Error fetching article content: ${error.message}`);
//   }
// };

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

  const extracFactCheckSchema = async (url) => {
    try {
        const response = await axios.get(url);
        const htmlContent = response.data;
        const $ = load(htmlContent);

        const claimReviewBlockSelector = ".claim-review-block";
        const titleSelector = "h1.entry-title.mb-10.entry-title-main-heading";
        const contextSelector = ".details-content-story";
        const authorSelector = "#after_author_link_2 .author-link";
        const detailsContentSelector = ".content.details-content-story.details-content-story-box1";
        
        let socialMediaLinks = [];
        let claim = "";
        let claimedBy = "";
        let claimedByInfo = "";
        let factCheck = "";
        let fallbackTitle = "";
        let context = "";
        let authors = [];
        let publicationDate = null;
        let claimUserWikiLink = "";
        let broaderIssueWiki = "";
        // Extract links from the specific content block
        $(detailsContentSelector).find('a').each((_, el) => {
          const link = $(el).attr('href');
          if (link && !link.includes('https://www.boomlive.in')) {
            socialMediaLinks.push(link);
          }
        });
        // Extract context
        const contextBlock = $(contextSelector);
        if (contextBlock.length) {
            context = contextBlock.text().trim();
        }

        // Extract claim, claimed by, and fact check values
        const claimReviewBlock = $(claimReviewBlockSelector);
        if (claimReviewBlock.length) {
            claim = claimReviewBlock.find(".claim-value .heading:contains('Claim') + .value").text().trim();
            claimedBy = claimReviewBlock.find(".claim-value .heading:contains('Claimed By') + .value").text().trim();
            factCheck = claimReviewBlock.find(".claim-value .heading:contains('Fact Check') + .value").text().trim();
        }

        // Extract publication date
        publicationDate = $("span.convert-to-localtime").text().trim();

        // Extract authors
        $(authorSelector).each((_, el) => {
            const authorName = $(el).text().trim();
            if (authorName) {
                authors.push(authorName);
            }
        });

        // Fallback: If no claim data is found, extract the title
        if (!claim && !factCheck && !claimedBy) {
            fallbackTitle = $(titleSelector).text().trim();
            broaderIssueWiki = await getWikipediaLink(fallbackTitle)

            if (!fallbackTitle) {
                throw new Error(
                    "Neither CLAIM/FACT CHECK/CLAIMED BY section nor fallback title found."
                );
            }
        }

        if(claimedBy){
          console.log("this is clame made by :"+ claimedBy);
          
          claimedByInfo = await getWikipediaSummary(claimedBy);
          claimUserWikiLink = await getWikipediaLink(claimedBy)
        }


        console.log("socialMediaLinks", socialMediaLinks);
        
        // Return the result
        return {
            url,
            claim: claim || null,
            claimedBy: claimedBy || null,
            factCheck: factCheck || null,
            fallbackTitle: fallbackTitle || null,

            // #################Section1#########################################

            context: context || null,
            publicationDate: publicationDate || null,
            authors: authors.length > 0 ? authors : null,

            // #################Section2#########################################
            socialMediaLinks: socialMediaLinks.length > 0 ? socialMediaLinks : null,

            //##################Section3###############################################

            claimedByInfo: claimedByInfo,
            claimUserWikiLink: claimUserWikiLink,

            //###########################Section4#########################################

            broaderIssueWiki: broaderIssueWiki,
        };
    } catch (error) {
        console.error(`Error extracting data from ${url}:`, error.message);
        return {
            url,
            error: `Failed to extract data: ${error.message}`,
        };
    }
};

  
module.exports = {
    fetchArticleContent,
    openai,
    extractArticleData,
    extracFactCheckSchema
  };
  