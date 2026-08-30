# Long-running Node host for Caddy on the VPS.
# Listens on PORT (default 3040). Does not bind :80 or :443.
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3040
ENV HOST=0.0.0.0

EXPOSE 3040

CMD ["npm", "start"]
