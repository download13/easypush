FROM node:6.9.1-slim

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app/
RUN npm install
COPY . /app

CMD ["npm", "start"]
