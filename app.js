const express = require("express");
require("dotenv").config();
const cors = require('cors');
const { sendContactEmail } = require("./api/services/emailService");
const { optimizeSeoUsingOpenAI} = require("./api/services/optimiseSeoUsingOpenai");
const { seoablityRes } = require("./api/services/seoScoreChecker");
const {  extractSentimentFromNews, extractSentimentFromNews2, generateSchemaFromArticle } = require("./api/services/analyzeNews"); // Import the summarizeNews function
const {  summarizeNews } = require("./api/services/summarizeNews"); // Import the summarizeNews function
const {  extractContentFromArticle } = require("./api/services/extractSectionsFromArticleUrl"); // Import the summarizeNews function
const {  extractFigureFromArticle } = require("./api/services/scrapCharts"); // Import the summarizeNews function

const {  fetchLinks } = require("./api/services/dynamicLinks"); // Import the summarizeNews function

const fileUpload = require('express-fileupload');
const app = express();
const axios = require("axios");

// Define allowed origins, including localhost on any port
const allowedOrigins = ['https://analyzesentiment.vercel.app','https://news-article-summarizer.vercel.app','https://nas-lovat.vercel.app','https://www.axionmatrix.com','https://axionmatrix.vercel.app','https://ims-api-beige.vercel.app', /^http:\/\/localhost:\d+$/];

// CORS options
const corsOptions = {
  // origin: function (origin, callback) {
  //   if (!origin || allowedOrigins.some((allowedOrigin) => allowedOrigin instanceof RegExp ? allowedOrigin.test(origin) : allowedOrigin === origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers if needed
};

// Use CORS with options and handle preflight requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware to handle file uploads
app.use(fileUpload({ useTempFiles: true }));

// Express JSON and URL-encoded data middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// SEO optimization route
app.post("/api/optimize-seo", async (req, res) => {
  const { headline, description, articleText, articleType, articlePreviewUrl, articleLanguage, focusKeywords } = req.body; // Expecting headline, description, and article text in the request body

  if (!articleText && !articlePreviewUrl) {
    return res.status(400).json({ error: `Article content is required` });
  }

  try {
    const optimizationResults = await optimizeSeoUsingOpenAI({ headline, description, articleText,articlePreviewUrl, articleType, articleLanguage, focusKeywords });
    res.status(200).json(optimizationResults); // Send back the SEO optimization results
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analayze sentiment

app.post("/api/sentiment", extractSentimentFromNews );



// Analyze sentiment 2

app.post("/api/sentiment2", extractSentimentFromNews2)


// Summarize Article

app.post("/api/summarize", summarizeNews);



// SeoScoreChecker

app.post("/api/seoability", seoablityRes)

// Download drive file

// Extract Content From Article

app.post("/api/extractArticleContent",extractContentFromArticle )

//Extract Charts From Article

app.post("/api/scrapCharts",extractFigureFromArticle);

// Generate Schema from Article

app.post("/api/generateSchema", generateSchemaFromArticle)

app.get('/download-file', async (req, res) => {
  const { fileId } = req.query; // Get the fileId from the query parameter
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    res.set({
      'Content-Disposition': 'attachment; filename="file.csv"', // Set a file name or use dynamic name based on your needs
      'Content-Type': response.headers['content-type'],
    });
    console.log(response.data); // Log the response data for debugging
    
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching file from Google Drive:', error); // Log the error
    res.status(500).json({ error: 'Failed to fetch file from Google Drive', details: error.message });
  }
});


// API to get User-Agent
app.get('/user-agent', (req, res) => {
  const userAgent = req.headers['user-agent'];
  res.json({ userAgent });
});


// Dynamic Link for The core
app.get('/fetch-links/:id', fetchLinks);

app.get("/api/boomlivenewsletter", async (req, res) => {
  try {
    const {
      emailId,
      beehiiv_publication_deepfake_watch,
      beehiiv_publication_verified_by_boom,
      beehiiv_publication_decode_with_adrija
    } = req.query; // Use req.query for GET requests

    // Check if the required parameter is provided
    if (!emailId) {
      return res.status(400).json({ success: false, error: "Missing required parameter: emailId" });
    }

    const response = await axios.get("https://boomlive.in/dev/h-api/subscribeCustomNewsletter", {
      params: {
        emailId,
        beehiiv_publication_deepfake_watch,
        beehiiv_publication_verified_by_boom,
        beehiiv_publication_decode_with_adrija,
      },
      headers: {
        "S-id": "1w3OEaLmf4lfyBxDl9ZrLPjVbSfKxQ4wQ6MynGpyv1ptdtQ0FcIXfjURSMRPwk1o", // Hardcoded S-id
      },
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// A fallback route to handle any other GET requests
app.get('*', (req, res) => {
  res.status(200).json({ message: 'Helldo' });
});

module.exports = app;
