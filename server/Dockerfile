FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
RUN npm run build

EXPOSE 3000

# On container start: run DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
