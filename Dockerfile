# Use Node.js 18 with Chrome pre-installed for Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Set working directory
WORKDIR /usr/src/app

# Copy package files as root
COPY --chown=pptruser:pptruser package*.json ./

# Install dependencies as pptruser
USER pptruser
RUN npm install --omit=dev && npm cache clean --force

# Switch back to root to copy remaining files
USER root

# Copy application files with correct ownership
COPY --chown=pptruser:pptruser . .

# Set up home directory
RUN mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Switch to non-root user for runtime
USER pptruser

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
