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

# tsc only compiles src/**/*.ts into dist/ — it doesn't copy the generated
# CMP Prisma client (JS + query engine binary), which prisma generate wrote
# to src/generated/cmp-client per its schema's custom `output`. Without this,
# dist/cmpPrisma.js's `require("./generated/cmp-client")` fails at runtime.
RUN cp -r src/generated dist/generated

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma migrate deploy --schema=prisma/cmp/schema.prisma && npx prisma db seed && npm run prisma:cmp:seed && node dist/index.js"]
