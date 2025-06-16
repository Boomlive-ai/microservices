// Enhanced OpenAI summarization for BOOM Evening Brief format
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

// Enhanced summarization for evening brief format
async function summarizeForEveningBrief(title, description) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a fact-check reporter for BOOM writing conversational evening briefings. Create narrative-style summaries that flow naturally in a newsletter format. Focus on:
        - What misinformation was spreading
        - What the reality actually was
        - Use conversational tone like "turned out to be", "actually showed", "we found that"
        - Make it engaging and readable for a general audience
        - Keep it concise but informative (30-40 words max)`
      },
      {
        role: 'user',
        content: `Create a conversational summary for this fact-check article:
        Title: ${title}
        Description: ${description}
        
        Write it as if explaining to a friend what misinformation was debunked. Start with what people thought was true, then reveal what actually happened.`
      }
    ],
    temperature: 0.7,
    max_tokens: 80
  });
  return response.choices[0].message.content.trim();
}

// Generate contextual opening for the brief based on articles
async function generateBriefOpening(articles) {
  const titles = articles.map(a => a.title).join('; ');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are writing the opening paragraph for BOOM's evening brief. Create a conversational, engaging opening that:
        - Sets the tone for what misinformation was trending today
        - Uses casual language like "Today saw...", "Several claims made rounds...", "It's been a busy day..."
        - Connects the different types of false claims thematically
        - Keep it under 25 words
        - Don't mention specific details, just set the scene`
      },
      {
        role: 'user',
        content: `Write an opening line for today's misinformation roundup based on these fact-check headlines: ${titles}`
      }
    ],
    temperature: 0.8,
    max_tokens: 50
  });
  return response.choices[0].message.content.trim();
}

// Generate contextual closing for the brief
async function generateBriefClosing(articlesCount) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Write a brief closing line for BOOM's evening newsletter. Should be conversational and reassuring. Examples:
        - "We're staying on top of it to make sure you get what's verified — not what's viral."
        - "As always, separating signal from noise in the information chaos."
        - "Keeping watch so you don't have to sort truth from fiction."
        Keep it under 20 words and maintain BOOM's authoritative but friendly tone.`
      },
      {
        role: 'user',
        content: `Write a closing line for today's brief covering ${articlesCount} fact-checks.`
      }
    ],
    temperature: 0.8,
    max_tokens: 40
  });
  return response.choices[0].message.content.trim();
}

// Format BOOM brief with user-provided title and plain links
function formatBoomBrief(articles, briefContext, userTitle = "BOOM Evening Brief") {
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (!articles || articles.length === 0) {
    return `${userTitle} | ${today}\n\nHey,\n\nQuiet day on the misinformation front. We're keeping our radar active.\n\n— Team BOOM`;
  }

  let briefContent = `${userTitle} | ${today}\n\nHey,\n\n`;

  // Use AI-generated opening if available
  if (briefContext?.opening) {
    briefContent += `${briefContext.opening} `;
  }

  // Add articles with natural flow and plain links - separate paragraphs for better readability
  articles.forEach((article, index) => {
    if (index === 0) {
      briefContent += `${article.summary} ${article.url}.\n\n`;
    } else if (index === 1) {
      briefContent += `Another viral claim ${article.summary.toLowerCase()} ${article.url}.\n\n`;
    } else {
      briefContent += `We also found ${article.summary.toLowerCase()} ${article.url}.\n\n`;
    }
  });

  // Use AI-generated closing if available
  if (briefContext?.closing) {
    briefContent += `${briefContext.closing}\n\n`;
  }

  briefContent += `— Team BOOM`;
  
  return briefContent;
}

// Main Express handler that returns formatted brief directly
async function summarizeMultipleArticles(req, res) {
  const { urls, title } = req.body; // Accept optional title parameter

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'Provide an array of at least one URL.' });
  }

  try {
    // Fetch all metadata in parallel
    const metadataList = await Promise.all(urls.map(fetchMetadata));

    // Build articles with enhanced summaries
    const articles = await Promise.all(metadataList.map(async (meta) => {
      const summary = meta.description ? 
        await summarizeForEveningBrief(meta.title, meta.description) : 
        'No summary available';
      
      return {
        title: meta.title,
        description: meta.description,
        date: meta.date,
        author: meta.author,
        url: meta.url,
        summary
      };
    }));

    // Generate contextual opening and closing
    const briefOpening = await generateBriefOpening(articles);
    const briefClosing = await generateBriefClosing(articles.length);

    const briefContext = {
      opening: briefOpening,
      closing: briefClosing
    };

    // Format the complete brief
    const formattedBrief = formatBoomBrief(articles, briefContext, title);

    // Return the formatted brief directly
    return res.json({
      success: true,
      articles_processed: articles.length,
      total_articles: urls.length,
      brief: formattedBrief,
      // Optional: include raw data for debugging/additional processing
      raw_data: {
        articles,
        brief_context: briefContext
      }
    });

  } catch (err) {
    console.error('summarizeMultipleArticles error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

module.exports = { 
  summarizeMultipleArticles, 
  formatBoomBrief,
  summarizeForEveningBrief,
  generateBriefOpening,
  generateBriefClosing
};

// Express route for generating the brief
// app.post("/api/summarize-multiple-articles", summarizeMultipleArticles);