FROM node:22-alpine

# Git + SSH needed for cloning repos directly, curl for healthchecks
RUN apk add --no-cache git openssh-client curl

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/entrypoint.sh"]
