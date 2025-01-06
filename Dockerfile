# Stage 1: Build Stage
FROM node:18.16.0-alpine3.18 AS build

# Set working directory
WORKDIR /usr/src/app

# Copy JWT certificates (if needed during build)
COPY /jwt ./

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
# RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

RUN npm prune --production

# Stage 2: Production Stage
FROM node:18.16.0-alpine3.18 AS production

# Set working directory
WORKDIR /usr/src/app

# Copy JWT certificates (for runtime usage)
# COPY /jwt ./

# Copy built application and dependencies from the build stage
COPY --from=build /usr/src/app/jwt ./jwt
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Set environment variables
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3009

# Start the application
CMD ["node", "dist/main.js"]
