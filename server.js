const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global browser state
let browser = null;
let page = null;

// Initialize browser
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions'
      ]
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    console.log('Browser initialized');
  }
  return { browser, page };
}

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ready',
    service: 'Puppeteer HTTP API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /navigate - Navigate to URL',
      'POST /type - Type text into element',
      'POST /click - Click element', 
      'POST /fill-form - Fill multiple form fields',
      'POST /get-text - Extract text from elements',
      'POST /screenshot - Take screenshot', 
      'POST /wait-for-element - Wait for element to appear',
      '--- ENHANCED TOOLS FOR VIRAL WORKFLOW ---',
      'POST /extract-data - Extract structured data from pages',
      'POST /download-media - Download files from URLs',
      'POST /upload-file - Upload files to platforms',
      'POST /process-media - Resize, convert, compress media',
      'POST /authenticate-platform - Login to social platforms',
      'POST /manage-session - Handle cookies and sessions',
      'POST /ai-service-request - Make requests to AI services',
      'POST /template-processor - Process templates with data',
      'POST /analyze-content - Extract insights and patterns',
      'POST /generate-variants - Create platform-specific content'
    ]
  });
});

// Navigate to URL
app.post('/navigate', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const { page } = await getBrowser();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    res.json({
      success: true,
      message: `Navigated to ${url}`,
      currentUrl: await page.url(),
      title: await page.title()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Navigation failed',
      message: error.message
    });
  }
});

// Type text with configurable delay and clear
app.post('/type', async (req, res) => {
  try {
    const { selector, text, delay = 0, clear = false } = req.body;
    
    if (!selector) {
      return res.status(400).json({ error: 'Selector is required' });
    }
    if (text === undefined) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const { page } = await getBrowser();
    await page.waitForSelector(selector, { timeout: 30000 });
    
    if (clear) {
      await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) element.value = '';
      }, selector);
    }
    
    await page.type(selector, text, { delay });
    
    res.json({
      success: true,
      message: `Typed "${text}" into ${selector}`,
      selector,
      textLength: text.length,
      delay,
      cleared: clear
    });
  } catch (error) {
    res.status(500).json({
      error: 'Type failed',
      message: error.message
    });
  }
});

// Click element
app.post('/click', async (req, res) => {
  try {
    const { selector } = req.body;
    
    if (!selector) {
      return res.status(400).json({ error: 'Selector is required' });
    }

    const { page } = await getBrowser();
    await page.waitForSelector(selector, { timeout: 30000 });
    await page.click(selector);
    
    res.json({
      success: true,
      message: `Clicked ${selector}`,
      selector
    });
  } catch (error) {
    res.status(500).json({
      error: 'Click failed',
      message: error.message
    });
  }
});

// Fill form with multiple fields
app.post('/fill-form', async (req, res) => {
  try {
    const { fields, submitSelector, submitDelay = 1000 } = req.body;
    
    if (!fields || typeof fields !== 'object') {
      return res.status(400).json({ error: 'Fields object is required' });
    }

    const { page } = await getBrowser();
    const fieldEntries = Object.entries(fields);
    
    // Fill each field
    for (const [selector, value] of fieldEntries) {
      await page.waitForSelector(selector, { timeout: 30000 });
      await page.type(selector, value);
    }
    
    // Submit if requested
    let submitted = false;
    if (submitSelector) {
      await new Promise(resolve => setTimeout(resolve, submitDelay));
      await page.waitForSelector(submitSelector, { timeout: 30000 });
      await page.click(submitSelector);
      submitted = true;
    }
    
    res.json({
      success: true,
      message: `Filled ${fieldEntries.length} fields${submitted ? ' and submitted form' : ''}`,
      fieldsCount: fieldEntries.length,
      submitted,
      submitDelay: submitted ? submitDelay : 0
    });
  } catch (error) {
    res.status(500).json({
      error: 'Form filling failed',
      message: error.message
    });
  }
});

// Get text from elements
app.post('/get-text', async (req, res) => {
  try {
    const { selector, multiple = false } = req.body;
    
    if (!selector) {
      return res.status(400).json({ error: 'Selector is required' });
    }

    const { page } = await getBrowser();
    
    if (multiple) {
      const elements = await page.$$(selector);
      const texts = await Promise.all(
        elements.map(element => element.evaluate(el => el.textContent?.trim() || ''))
      );
      
      res.json({
        success: true,
        texts,
        count: texts.length,
        message: `Extracted text from ${texts.length} elements`
      });
    } else {
      const element = await page.$(selector);
      if (!element) {
        return res.status(404).json({ error: `Element not found: ${selector}` });
      }
      
      const text = await element.evaluate(el => el.textContent?.trim() || '');
      
      res.json({
        success: true,
        text,
        message: `Extracted text: "${text}"`
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Text extraction failed',
      message: error.message
    });
  }
});

// Take screenshot
app.post('/screenshot', async (req, res) => {
  try {
    const { selector, fullPage = false } = req.body;
    
    const { page } = await getBrowser();
    let screenshot;
    
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return res.status(404).json({ error: `Element not found: ${selector}` });
      }
      screenshot = await element.screenshot({ encoding: 'base64' });
    } else {
      screenshot = await page.screenshot({ 
        encoding: 'base64',
        fullPage
      });
    }
    
    res.json({
      success: true,
      screenshot: `data:image/png;base64,${screenshot}`,
      message: `Screenshot taken${selector ? ` of ${selector}` : ''}`,
      fullPage
    });
  } catch (error) {
    res.status(500).json({
      error: 'Screenshot failed',
      message: error.message
    });
  }
});

// Wait for element to appear
app.post('/wait-for-element', async (req, res) => {
  try {
    const { selector, timeout = 30000, visible = false } = req.body;
    
    if (!selector) {
      return res.status(400).json({ error: 'Selector is required' });
    }

    const { page } = await getBrowser();
    await page.waitForSelector(selector, { timeout, visible });
    
    res.json({
      success: true,
      message: `Element ${selector} appeared${visible ? ' and is visible' : ''}`,
      selector,
      timeout,
      waitedForVisible: visible
    });
  } catch (error) {
    res.status(500).json({
      error: 'Wait failed', 
      message: error.message
    });
  }
});

// ====== ENHANCED CHAINABLE TOOLS FOR VIRAL WORKFLOW ======

// Extract structured data from any webpage
app.post('/extract-data', async (req, res) => {
  try {
    const { 
      selectors = {}, 
      dataTypes = ['text', 'links', 'images'], 
      limit = 50,
      waitFor = null 
    } = req.body;
    
    const { page } = await getBrowser();
    
    if (waitFor) {
      await page.waitForSelector(waitFor, { timeout: 30000 });
    }
    
    const extractedData = await page.evaluate((selectors, dataTypes, limit) => {
      const data = {};
      
      // Extract by custom selectors
      Object.entries(selectors).forEach(([key, selector]) => {
        const elements = document.querySelectorAll(selector);
        data[key] = Array.from(elements).slice(0, limit).map(el => ({
          text: el.textContent?.trim() || '',
          href: el.href || '',
          src: el.src || '',
          alt: el.alt || '',
          className: el.className || ''
        }));
      });
      
      // Extract common data types
      if (dataTypes.includes('text')) {
        data.allText = Array.from(document.querySelectorAll('p, h1, h2, h3, span'))
          .slice(0, limit)
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 10);
      }
      
      if (dataTypes.includes('links')) {
        data.links = Array.from(document.querySelectorAll('a[href]'))
          .slice(0, limit)
          .map(a => ({
            text: a.textContent?.trim() || '',
            url: a.href,
            title: a.title || ''
          }));
      }
      
      if (dataTypes.includes('images')) {
        data.images = Array.from(document.querySelectorAll('img[src]'))
          .slice(0, limit)
          .map(img => ({
            src: img.src,
            alt: img.alt || '',
            width: img.naturalWidth || img.width,
            height: img.naturalHeight || img.height
          }));
      }
      
      if (dataTypes.includes('metrics')) {
        const metricElements = document.querySelectorAll('[aria-label*="like"], [aria-label*="view"], [data-testid*="like"]');
        data.metrics = Array.from(metricElements).map(el => ({
          text: el.textContent?.trim() || '',
          label: el.getAttribute('aria-label') || ''
        }));
      }
      
      return data;
    }, selectors, dataTypes, limit);
    
    res.json({
      success: true,
      url: await page.url(),
      extractedData,
      message: `Data extraction completed with ${Object.keys(extractedData).length} data types`
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Data extraction failed',
      message: error.message
    });
  }
});

// Download media from URLs
app.post('/download-media', async (req, res) => {
  try {
    const { urls, outputFormat = 'base64' } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }
    
    const { page } = await getBrowser();
    const downloads = [];
    
    for (const url of urls.slice(0, 10)) { // Limit to 10 files
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle2' });
        
        if (response && response.ok()) {
          const buffer = await response.buffer();
          const contentType = response.headers()['content-type'] || 'application/octet-stream';
          
          downloads.push({
            url,
            contentType,
            size: buffer.length,
            data: outputFormat === 'base64' ? `data:${contentType};base64,${buffer.toString('base64')}` : null,
            success: true
          });
        }
      } catch (error) {
        downloads.push({
          url,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      downloads,
      successCount: downloads.filter(d => d.success).length,
      message: `Downloaded ${downloads.filter(d => d.success).length}/${urls.length} files`
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Media download failed',
      message: error.message
    });
  }
});

// Authenticate with social platforms
app.post('/authenticate-platform', async (req, res) => {
  try {
    const { platform, credentials = {} } = req.body;
    
    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }
    
    const { page } = await getBrowser();
    let authResult = {};
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
        authResult = {
          platform: 'instagram',
          loginPageLoaded: true,
          nextSteps: 'Use type and click tools to enter credentials'
        };
        break;
        
      case 'tiktok':
        await page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle2' });
        authResult = {
          platform: 'tiktok',
          loginPageLoaded: true
        };
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }
    
    res.json({
      success: true,
      platform,
      authResult,
      currentUrl: await page.url(),
      message: `Authentication page loaded for ${platform}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Platform authentication failed',
      message: error.message
    });
  }
});

// Make requests to AI services
app.post('/ai-service-request', async (req, res) => {
  try {
    const { endpoint, data, headers = {}, method = 'POST' } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }
    
    const { page } = await getBrowser();
    
    const apiResult = await page.evaluate(async (endpoint, data, headers, method) => {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: method !== 'GET' ? JSON.stringify(data) : undefined
        });
        
        const responseData = await response.json();
        
        return {
          success: response.ok,
          status: response.status,
          data: responseData
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    }, endpoint, data, headers, method);
    
    res.json({
      success: apiResult.success,
      endpoint,
      method,
      response: apiResult,
      message: `AI service request completed`
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'AI service request failed',
      message: error.message
    });
  }
});

// Process templates with dynamic data
app.post('/template-processor', async (req, res) => {
  try {
    const { template, data, templateType = 'text' } = req.body;
    
    if (!template || !data) {
      return res.status(400).json({ error: 'Template and data are required' });
    }
    
    let processed = template;
    
    // Replace {{key}} with values
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      processed = processed.replace(placeholder, value);
    });
    
    let result = { processed };
    
    if (templateType === 'social-media') {
      result.platforms = {
        instagram: processed.substring(0, 2200),
        twitter: processed.substring(0, 280),
        tiktok: processed.substring(0, 150)
      };
    }
    
    res.json({
      success: true,
      templateType,
      result,
      message: 'Template processing completed'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Template processing failed',
      message: error.message
    });
  }
});

// Analyze content for insights
app.post('/analyze-content', async (req, res) => {
  try {
    const { content, analysisTypes = ['keywords', 'engagement'] } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const analysis = {};
    
    if (Array.isArray(content)) {
      analysis.contentCount = content.length;
      
      if (analysisTypes.includes('engagement')) {
        const metrics = content.map(c => ({
          likes: parseMetric(c.likes || 0),
          comments: parseMetric(c.comments || 0)
        }));
        
        analysis.engagement = {
          avgLikes: metrics.reduce((sum, m) => sum + m.likes, 0) / metrics.length,
          avgComments: metrics.reduce((sum, m) => sum + m.comments, 0) / metrics.length,
          topPerforming: content
            .map((c, i) => ({ ...c, totalEngagement: metrics[i].likes + metrics[i].comments }))
            .sort((a, b) => b.totalEngagement - a.totalEngagement)
            .slice(0, 3)
        };
      }
    } else if (typeof content === 'string') {
      if (analysisTypes.includes('keywords')) {
        analysis.keywords = extractTopWords(content, 10);
        analysis.hashtags = extractHashtags(content);
      }
      analysis.wordCount = content.split(' ').length;
    }
    
    res.json({
      success: true,
      analysis,
      message: 'Content analysis completed'
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Content analysis failed',
      message: error.message
    });
  }
});

// Generate platform-specific variants
app.post('/generate-variants', async (req, res) => {
  try {
    const { baseContent, platforms = ['instagram', 'twitter', 'tiktok'] } = req.body;
    
    if (!baseContent) {
      return res.status(400).json({ error: 'Base content is required' });
    }
    
    const variants = {};
    
    platforms.forEach(platform => {
      switch (platform.toLowerCase()) {
        case 'instagram':
          variants.instagram = {
            caption: baseContent.substring(0, 2200),
            hashtags: extractHashtags(baseContent).slice(0, 30),
            dimensions: '1080x1080'
          };
          break;
          
        case 'twitter':
          variants.twitter = {
            text: baseContent.substring(0, 280),
            hashtags: extractHashtags(baseContent).slice(0, 2),
            dimensions: '1200x675'
          };
          break;
          
        case 'tiktok':
          variants.tiktok = {
            description: baseContent.substring(0, 150),
            hashtags: extractHashtags(baseContent).slice(0, 5),
            dimensions: '1080x1920'
          };
          break;
      }
    });
    
    res.json({
      success: true,
      baseContent,
      variants,
      message: `Generated ${Object.keys(variants).length} platform variants`
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Variant generation failed',
      message: error.message
    });
  }
});

// Helper functions
function extractTopWords(text, limit = 10) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map(tag => tag.toLowerCase());
}

function parseMetric(metric) {
  if (!metric) return 0;
  const str = metric.toString().toLowerCase();
  if (str.includes('k')) return parseFloat(str) * 1000;
  if (str.includes('m')) return parseFloat(str) * 1000000;
  return parseInt(str) || 0;
}

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Puppeteer HTTP API running on:`);
  console.log(`  - http://localhost:${port}`);
  console.log(`  - http://127.0.0.1:${port}`);
  console.log(`🌐 Ready for Make.com HTTP requests`);
});

module.exports = app;