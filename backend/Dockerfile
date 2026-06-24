FROM node:20-alpine

WORKDIR /app

# Installe les dépendances (cache Docker tant que package*.json ne change pas)
COPY package*.json ./
RUN npm ci --omit=dev

# Copie le code source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
