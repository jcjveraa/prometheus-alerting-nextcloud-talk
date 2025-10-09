FROM node:22-alpine@sha256:605dc0b362bd1781359cf97eea543e082f28784408f85c37c19f612fcf46b83e

WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary files
COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist

# Use non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]