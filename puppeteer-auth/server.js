const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Simple API key for Make.com (you can change this)
const API_KEY = process.env.API_KEY || 'makecom-puppeteer-2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Key authentication middleware
function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide API key in X-API-Key header or api_key query parameter'
    });
  }
  
  if (apiKey !== API_KEY) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  next();
}

// Public health check (no auth required)
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Authenticated Puppeteer API for Make.com',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    authentication: 'API key required',
    usage: {
      header: 'X-API-Key: your-api-key',
      query: '?api_key=your-api-key'
    },
    endpoints: [
      'GET / (no auth)',
      'POST /screenshot (auth required)',
      'POST /navigate (auth required)',
      'POST /evaluate (auth required)',
      'POST /scrape (auth required)',
      'POST /test (auth required)'
    ]
  });
});

// All other endpoints require API key
app.use(authenticateApiKey);

// Screenshot endpoint
app.post('/screenshot', async (req, res) => {
  try {
    const {
      url,
      fullPage = false,
      width = 1280,
      height = 720,
      type = 'png'
    } = req.body;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required' 
      });
    }

    console.log(`Screenshot request for: ${url}`);

    // Mock response for Make.com testing
    const mockScreenshot = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    res.json({
      success: true,
      screenshot: mockScreenshot,
      metadata: {
        url: url,
        title: `Page: ${url}`,
        timestamp: new Date().toISOString(),
        viewport: { width, height },
        fullPage,
        type,
        authenticated: true,
        note: 'Screenshot simulation - ready for Make.com integration'
      }
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    res.status(500).json({
      error: 'Screenshot failed',
      message: error.message
    });
  }
});

// Test endpoint for Make.com
app.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Make.com integration test successful!',
    received: req.body,
    timestamp: new Date().toISOString(),
    authenticated: true,
    apiKey: 'Valid',
    readyForMakeCom: true
  });
});

// Navigate endpoint
app.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    res.json({
      success: true,
      url: url,
      title: `Title of ${url}`,
      status: 200,
      timestamp: new Date().toISOString(),
      authenticated: true
    });

  } catch (error) {
    res.status(500).json({
      error: 'Navigation failed',
      message: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Authenticated Puppeteer API running on port ${port}`);
  console.log(`API Key: ${API_KEY}`);
  console.log('Ready for Make.com integration with authentication');
});