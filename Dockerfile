FROM node:22-alpine@sha256:d2166de198f26e17e5a442f537754dd616ab069c47cc57b889310a717e0abbf9

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