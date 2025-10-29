FROM node:22-alpine@sha256:2d20b9dbc1765bfc9ea488548701f04e071d45dc1dd730f4f280510a24075ac4

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