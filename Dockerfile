FROM node:22-alpine@sha256:3cede0390df539fee0ec4634ca957539b887528ce2824bb2b631aec414bfa06c

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