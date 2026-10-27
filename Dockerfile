
FROM node:26-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY .env ./
COPY tsconfig.json ./
COPY .sequelizerc ./
COPY src/ ./src/

RUN npm run build

CMD ["npm", "start"]
