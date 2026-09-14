FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Instalação das dependências
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte e compilar
COPY . .
RUN npm run build

# Imagem de produção final
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node prisma/seed.js || true && node dist/src/main.js"]
