FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY src ./src
COPY sql ./sql
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
