const axios = require("axios");
const { load } = require("cheerio");

const extractClaimAndFactCheckOrTitle = async (url) => {
  try {
    const response = await axios.get(url);
    const htmlContent = response.data;
    const $ = load(htmlContent);

    const claimReviewBlockSelector = ".claim-review-block";
    const titleSelector = "h1.entry-title.mb-10.entry-title-main-heading";

    let claim = "";
    let claimedBy = "";
    let factCheck = "";
    let fallbackTitle = "";

    // Check if the claim review block exists
    const claimReviewBlock = $(claimReviewBlockSelector);
    if (claimReviewBlock.length) {
      // Extract the CLAIM value
      claim = claimReviewBlock
        .find(".claim-value .heading:contains('Claim') + .value")
        .text()
        .trim();

      // Extract the CLAIMED BY value
      claimedBy = claimReviewBlock
        .find(".claim-value .heading:contains('Claimed By') + .value")
        .text()
        .trim();

      // Extract the FACT CHECK value
      factCheck = claimReviewBlock
        .find(".claim-value .heading:contains('Fact Check') + .value")
        .text()
        .trim();
    }

    // Fallback: If CLAIM/CLAIMED BY/FACT CHECK are not found, extract the title
    if (!claim && !factCheck && !claimedBy) {
      fallbackTitle = $(titleSelector).text().trim();
      if (!fallbackTitle) {
        throw new Error(
          "Neither CLAIM/FACT CHECK/CLAIMED BY section nor fallback title found."
        );
      }
    }

    // Return the result
    return {
      url,
      claim: claim || null,
      claimedBy: claimedBy || null,
      factCheck: factCheck || null,
      fallbackTitle: fallbackTitle || null,
    };
  } catch (error) {
    console.error(`Error extracting data from ${url}:`, error.message);
    return {
      url,
      error: `Failed to extract data: ${error.message}`,
    };
  }
};

const extractContentFromArticle = async (req, res) => {
  const { urls } = req.body; // Expecting an array of URLs in the request body

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "An array of URLs is required" });
  }

  try {
    // Process all URLs in parallel using Promise.all
    const results = await Promise.all(urls.map((url) => extractClaimAndFactCheckOrTitle(url)));

    // Return an array of results
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: "Failed to process the URLs", details: error.message });
  }
};

module.exports = {
  extractContentFromArticle,
};
