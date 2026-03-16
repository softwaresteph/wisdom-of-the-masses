FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY . .
ARG APP_VERSION=unknown
ENV APP_VERSION=${APP_VERSION}
EXPOSE 3000
CMD ["node", "server.js"]
