FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /build/backend ./backend
COPY --from=builder /build/frontend/dist ./frontend/dist
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "backend/server.js"]
