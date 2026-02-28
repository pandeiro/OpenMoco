FROM node:22-alpine

# Git + SSH needed for cloning repos directly, curl for healthchecks
RUN apk add --no-cache git openssh-client curl

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
