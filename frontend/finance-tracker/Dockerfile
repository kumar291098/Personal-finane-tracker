# Multi-stage build for React frontend
# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/

# Copy built React app
COPY --from=build /build/build /usr/share/nginx/html

# Expose port
EXPOSE 3000 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
