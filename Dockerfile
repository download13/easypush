FROM node:14.3.0
RUN mkdir -p /app
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY . /app
ENV NODE_ENV production
CMD ["node", "src/server/index.js"]
