# Use Node.js 18 with Chrome pre-installed for Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy application files
COPY . .

# Install dependencies as root first
RUN npm install --omit=dev && npm cache clean --force

# Set up home directory and change ownership of everything at once
RUN mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app

# Switch to non-root user
USER pptruser

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
