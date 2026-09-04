# Build Stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if you have SPA routing needs (omitted for brevity)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
