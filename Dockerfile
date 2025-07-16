FROM node:22-alpine@sha256:fc3e945f920b7e3000cd1af86c4ae406ec70c72f328b667baf0f3a8910d69eed

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