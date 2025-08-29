# Use Node.js 18 with Chrome pre-installed for Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Set working directory
WORKDIR /usr/src/app

# Ensure pptruser exists and set up directories
RUN mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app

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
