FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm install
COPY . .
RUN npm run db:generate -w server && npm run build
EXPOSE 4000
CMD ["npm","run","dev","-w","server"]