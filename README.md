# Puppeteer HTTP API for Make.com

HTTP API server for browser automation that Make.com can call directly.

## Deployment Options

### Option 1: Deploy to Render (Recommended)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Connect your GitHub repo to Render
2. Use these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`

**Deployed URL:** Your Render app URL (e.g., `https://your-app.onrender.com`)

### Option 2: Local Development
1. **Install & Start:**
   ```bash
   npm install
   npm start
   ```
2. **Server URL:** `http://localhost:3002`

## Make.com Integration

Use **HTTP > Make a request** module:

- **URL:** `https://your-app.onrender.com/{endpoint}` (or `http://localhost:3002/{endpoint}` for local)
- **Method:** `POST` 
- **Headers:** `Content-Type: application/json`
- **Body Type:** Raw (JSON)

## Available Endpoints

### Navigate to URL
**POST** `/navigate`
```json
{
  "url": "https://example.com"
}
```

### Type Text
**POST** `/type`
```json
{
  "selector": "#username",
  "text": "myusername", 
  "delay": 50,
  "clear": true
}
```

### Click Element
**POST** `/click`
```json
{
  "selector": "button.submit"
}
```

### Fill Form
**POST** `/fill-form`
```json
{
  "fields": {
    "#username": "john",
    "#email": "john@example.com",
    "#password": "secret123"
  },
  "submitSelector": "button[type='submit']",
  "submitDelay": 2000
}
```

### Get Text
**POST** `/get-text`
```json
{
  "selector": ".price",
  "multiple": false
}
```

### Screenshot
**POST** `/screenshot`
```json
{
  "selector": ".content",
  "fullPage": false
}
```

### Wait for Element
**POST** `/wait-for-element`
```json
{
  "selector": ".loading-complete",
  "timeout": 10000,
  "visible": true
}
```

## Example Make.com Workflow

1. **Navigate:** `POST http://localhost:3001/navigate`
   ```json
   {"url": "https://login.example.com"}
   ```

2. **Fill Login:** `POST http://localhost:3001/fill-form`
   ```json
   {
     "fields": {
       "#username": "myuser",
       "#password": "mypass"
     },
     "submitSelector": "#login-btn"
   }
   ```

3. **Wait for Dashboard:** `POST http://localhost:3001/wait-for-element`
   ```json
   {"selector": ".dashboard", "visible": true}
   ```

4. **Extract Data:** `POST http://localhost:3001/get-text`
   ```json
   {"selector": ".user-info", "multiple": true}
   ```

## Auto-Start Options

### Windows Task Scheduler
```
Program: node
Arguments: server.js  
Start in: C:\path\to\puppeteer-mcp
```

### PM2 Process Manager
```bash
npm install -g pm2
pm2 start server.js --name puppeteer-api
pm2 startup
pm2 save
```

Ready for Make.com automation!