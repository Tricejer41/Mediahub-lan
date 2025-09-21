# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Instala deps
COPY package.json package-lock.json ./
RUN npm ci

# Copia el código y build
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copiamos sólo lo necesario para ejecutar
# (server.js + node_modules pruned que Next empaqueta en .next/standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
