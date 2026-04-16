FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY proxy.js ./
COPY public/ ./public/

EXPOSE 10000

CMD ["node", "proxy.js"]
