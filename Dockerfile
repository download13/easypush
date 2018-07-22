FROM node:6.9.1-slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install --production
COPY . /app

CMD ["NODE_ENV=production node src/server/index.js"]
