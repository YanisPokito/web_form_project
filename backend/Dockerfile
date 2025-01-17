FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
RUN npm install

# Copier les autres fichiers du dossier backend
COPY backend ./

# Exposer le port
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "server.js"]
