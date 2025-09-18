# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
# Agar TypeScript hai toh tsconfig, etc
COPY backend/tsconfig.json ./

RUN npm install --production

# Copy rest of backend source
COPY backend/. .

# Build step, agar TypeScript hai
RUN npm run build

EXPOSE 5000 

CMD ["node", "dist/index.js"]  
