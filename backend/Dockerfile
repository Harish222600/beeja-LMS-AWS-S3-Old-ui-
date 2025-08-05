# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild native dependencies for the container architecture
RUN npm rebuild bcrypt --build-from-source
RUN npm rebuild sharp --build-from-source

# Bundle app source
COPY . .

# Expose port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]
