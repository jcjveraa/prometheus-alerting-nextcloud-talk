FROM node:22-alpine

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