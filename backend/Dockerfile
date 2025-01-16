# Utiliser une image Node.js officielle
FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY backend/package*.json ./
RUN npm install

# Copier le reste des fichiers
COPY backend ./

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "server.js"]
