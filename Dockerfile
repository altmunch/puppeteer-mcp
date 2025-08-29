# Use Node.js 18 with Chrome pre-installed for Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Set working directory
WORKDIR /usr/src/app

# Create non-root user for security first
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Copy package files and set ownership
COPY --chown=pptruser:pptruser package*.json ./

# Switch to non-root user before npm install
USER pptruser

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy application files
COPY --chown=pptruser:pptruser . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
