FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npx prisma generate --schema=prisma/cmp/schema.prisma
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma migrate deploy --schema=prisma/cmp/schema.prisma && npx prisma db seed && npm run prisma:cmp:seed && node dist/index.js"]
