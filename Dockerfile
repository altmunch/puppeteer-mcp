# Use Node.js 18 with Chrome pre-installed for Puppeteer
FROM ghcr.io/puppeteer/puppeteer:21.0.0

# Set working directory
WORKDIR /usr/src/app

# Copy all application files first with correct ownership
COPY --chown=pptruser:pptruser . .

# Set up home directory
RUN mkdir -p /home/pptruser/Downloads && \
    chown -R pptruser:pptruser /home/pptruser

# Switch to pptruser for npm install
USER pptruser

# Install dependencies
RUN npm install --omit=dev && npm cache clean --force

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
