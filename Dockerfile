FROM nubs/npm-gyp-build:fbee23024be8
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app/
RUN npm install --production
COPY . /app
ENV NODE_ENV production
CMD ["node", "src/server/index.js"]
