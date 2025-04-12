# Build stage
FROM node:22-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install all dependencies (including dev dependencies)
COPY package*.json ./
COPY tsconfig.json ./
RUN NODE_ENV=development npm ci

# Copy source code and compile TypeScript
COPY src ./src
RUN npm run build

# Generate production node_modules
RUN npm ci

# Final stage
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Copy only the necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Use non-root user
USER node

EXPOSE 3000
CMD ["npm", "start"]