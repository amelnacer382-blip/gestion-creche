FROM oven/bun:1-slim

WORKDIR /app

# Copy dependency definitions and lockfiles
COPY package.json ./
COPY frontend/package.json frontend/bun.lock* ./frontend/
COPY backend/package.json backend/bun.lock* ./backend/

# Install dependencies
RUN cd frontend && bun install
RUN cd backend && bun install

# Copy full source
COPY . .

# Build both frontend and backend
RUN cd frontend && bun run build
RUN cd backend && bun run build

# Seed database with initial data
RUN cd backend && bun run src/db/seed.ts

EXPOSE 5050
ENV PORT=5050
ENV NODE_ENV=production

CMD ["bun", "run", "backend/dist/index.js"]
