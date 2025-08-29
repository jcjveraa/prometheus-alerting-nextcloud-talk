FROM node:22-alpine@sha256:8be1dd87743236c7d064aac3733befca88ba9bc6f65c7f6bbd93199f27c33287

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