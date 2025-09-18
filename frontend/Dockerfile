# frontend/Dockerfile
FROM node:20-alpine as build

WORKDIR /app

COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/ ./

RUN npm install
RUN npm run build

# Serve using nginx (production)
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html  
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
