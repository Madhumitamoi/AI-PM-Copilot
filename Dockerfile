FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Default to dev server, can override with npm start for production
CMD ["npm", "run", "dev"]
