FROM node:20-alpine

WORKDIR /app

# Installe toutes les dépendances (build inclus)
COPY package*.json ./
RUN npm ci

# Copie le code source
COPY . .

# NEXT_PUBLIC_* doit être disponible AU BUILD : Next.js l'injecte dans le bundle client.
# Valeur fournie par docker-compose (build.args), défaut = localhost pour un build local.
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
