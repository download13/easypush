FROM node:14.11.0-alpine3.10
# TODO: update node 10.7.0-alpine
RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install --production
COPY . /app

ENV NODE_ENV production

CMD ["node", "src/server/index.js"]
