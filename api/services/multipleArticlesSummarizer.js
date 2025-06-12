// Simplified article fetcher & ultra-concise summarizer for frontend formatting
const axios = require("axios");
const { load } = require("cheerio");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fetch metadata (title, complete description, date, author) from a URL
async function fetchMetadata(url) {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);

    // Try meta description first
    let description = $('meta[property="og:description"]').attr('content')
                   || $('meta[name="description"]').attr('content')
                   || '';
    // If too short or ends in ellipsis, fallback to first meaningful paragraph
    if (!description || description.length < 50 || /\.\.\.$/.test(description.trim())) {
      description = $('article p').first().text().trim() || $('p').first().text().trim();
    }

    return {
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || 'No title',
      description: description || 'No description found',
      date: $('meta[property="article:published_time"]').attr('content')
            || $('meta[name="date"]').attr('content')
            || null,
      author: $('meta[name="author"]').attr('content')
              || $('meta[property="article:author"]').attr('content')
              || null,
      url
    };
  } catch (err) {
    console.error(`fetchMetadata error for ${url}:`, err.message);
    return { title: 'Unknown', description: '', date: null, author: null, url };
  }
}

// Generate ultra-concise summary with OpenAI
async function summarizeText(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a super concise summarizer. Summarize in one punchy sentence that highlights the key insight.'
      },
      {
        role: 'user',
        content: `Summarize this text in a single, compelling sentence: ${text}`
      }
    ],
    temperature: 0.5,
    max_tokens: 50
  });
  return response.choices[0].message.content.trim();
}

// Main Express handler: return raw metadata plus AI summary
async function summarizeMultipleArticles(req, res) {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Provide an array of at least one URL.' });
  }

  try {
    // Fetch all metadata in parallel
    const metadataList = await Promise.all(urls.map(fetchMetadata));

    // Build articles with ultra-concise summaries
    const articles = await Promise.all(metadataList.map(async (meta) => {
      const input = meta.description || meta.title;
      const summary = input ? await summarizeText(input) : '';
      return {
        title: meta.title,
        description: meta.description,
        date: meta.date,
        author: meta.author,
        url: meta.url,
        summary
      };
    }));

    // Respond with structured data for frontend formatting
    return res.json({
      success: true,
      articles_processed: articles.length,
      total_articles: urls.length,
      articles
    });
  } catch (err) {
    console.error('summarizeMultipleArticles error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

module.exports = { summarizeMultipleArticles };
