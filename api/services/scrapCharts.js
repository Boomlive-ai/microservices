const axios = require("axios");
const { load } = require("cheerio");

const extractIFrameSrc = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = load(response.data);

    // Use a Set to store unique iframe sources
    const iframeSrcs = new Set();
    $("iframe, h-iframe").each((_, element) => {
      const src = $(element).attr("src");
      if (src) iframeSrcs.add(src);
    });

    return { url, iframes: Array.from(iframeSrcs) };
  } catch (error) {
    console.error(`Error extracting iframes from ${url}:`, error.message);
    return { url, error: `Failed to extract iframes: ${error.message}` };
  }
};

const extractFigureFromArticle = async (req, res) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "An array of URLs is required" });
  }

  try {
    const results = await Promise.all(urls.map((url) => extractIFrameSrc(url)));
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: "Failed to process URLs", details: error.message });
  }
};

module.exports = { extractFigureFromArticle };
