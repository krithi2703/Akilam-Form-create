# Stage 1: Build React app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add fallback rule directly into default.conf
RUN echo 'server { \
    listen 5558; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 5558

CMD ["nginx", "-g", "daemon off;"]
