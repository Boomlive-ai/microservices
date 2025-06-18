// Enhanced OpenAI summarization for BOOM formats
const axios = require("axios");
const { load } = require("cheerio");
const dayjs = require('dayjs');              // for current date formatting
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fetch metadata (title, description, date, author) from a URL
async function fetchMetadata(url) {
  try {
    const { data } = await axios.get(url);
    const $ = load(data);

    let description = $('meta[property="og:description"]').attr('content')
                   || $('meta[name="description"]').attr('content')
                   || '';
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

// Summarize each article snippet (25-35 words) in BOOM tone
async function summarizeForEveningBrief(title, description) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `You write punchy, user-friendly fact checks for BOOM. Keep it 25–35 words, active voice, no "Hey". Show what was claimed vs. reality in a cheeky, clear style.` },
      { role: 'user', content: `Title: ${title}\nDescription: ${description}` }
    ],
    temperature: 0.7,
    max_tokens: 60
  });
  return resp.choices[0].message.content.trim();
}

// Generate a zestful opening line in BOOM's style
async function generateBriefOpening(headlines) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `You're BOOM Live! Write a snappy opening (under 25 words) that teases today's wildest misinformation wave. Think cheeky, gripping, and energetic—no dry news-speak.` },
      { role: 'user', content: `Headlines: ${headlines.join('; ')}` }
    ],
    temperature: 0.8,
    max_tokens: 50
  });
  return resp.choices[0].message.content.trim();
}

// Generate a friendly BOOM-style closing line
async function generateBriefClosing(count) {
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: `You’re wrapping up BOOM’s evening. Write a warm, witty closing for ${count} fact-checks that reassures and entertains.` }
    ],
    temperature: 0.8,
    max_tokens: 40
  });
  return resp.choices[0].message.content.trim();
}

// Generate the full BOOM-style story via OpenAI
// Generate the full story without exaggeration
async function generateFullStory(articles, title, opening, closing) {
  const today = dayjs().format('MMMM D, YYYY');
  const payload = articles.map(a => ({ url: a.url, summary: a.summary }));

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You’re BOOM’s host. Tell readers what happened today in a clear, conversational flow:

🚨 Begins with "${title} – ${today}"

Hey, (newline)

• Present each fact-check summary inline with its URL as a Markdown link and make sure the link is embeded in summary statements not in Read more or click here.
• Use a friendly, engaging tone which narerates the events as they unfolded today to  keep readers hooked
• Use the conversational flow like a message and someone is narating what happened.
• Narrate the events as they unfolded today without exaggeration
• After summaries, include the provided closing line
• End with "— Team BOOM"

Return plain text with Markdown links.`
      },
      { role: 'user', content: JSON.stringify({ articles: payload, opening, closing }, null, 2) }
    ],
    temperature: 0.5,
    max_tokens: 400
  });

  return resp.choices[0].message.content.trim();
}


// Express handler
async function summarizeMultipleArticles(req, res) {
  const { urls, title = "Today's Fact Check" } = req.body;
  if (!Array.isArray(urls) || !urls.length) {
    return res.status(400).json({ error: 'Provide an array of URLs.' });
  }
  try {
    // Fetch metadata & create summaries
    const metas = await Promise.all(urls.map(fetchMetadata));
    const summaries = await Promise.all(
      metas.map(m => summarizeForEveningBrief(m.title, m.description))
    );

    const articles = metas.map((m, i) => ({ ...m, summary: summaries[i] }));

    // Opening & closing lines
    const opening = await generateBriefOpening(metas.map(m => m.title));
    const closing = await generateBriefClosing(articles.length);

    // Full story
    const fullStory = await generateFullStory(articles, title, opening, closing);

    return res.json({ success: true, brief: fullStory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

module.exports = { summarizeMultipleArticles };
