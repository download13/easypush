FROM node:14.3.0 AS build
WORKDIR /app
COPY package.json webpackfile.cjs .env ./
RUN npm install
COPY prisma ./prisma
COPY src ./src
ARG NODE_ENV=production
RUN npm run build
RUN npm prune

FROM node:14.3.0 AS deploy
WORKDIR /app
COPY --from=build /app ./
ENV NODE_ENV production
CMD ["node", "dsit/server/index.js"]
