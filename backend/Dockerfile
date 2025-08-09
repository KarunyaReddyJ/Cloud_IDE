FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# === Stage 2: Runtime stage ===
FROM node:20-slim

WORKDIR /app

# Only copy installed node_modules and code
COPY --from=builder /app /app

ENV NODE_ENV=production
ENV PORT=3000

# Load environment variables (optional, useful for debugging inside container)
ENV NODE_ENV=production
ENV PORT=3000
# Expose a port (can be overridden by docker-compose or run command)
EXPOSE 3000 5000 5173

# Start the app
CMD ["npm", "start"]
