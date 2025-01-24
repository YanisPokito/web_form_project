# Utiliser une image officielle de Node.js
FROM node:16

# Définir le répertoire de travail pour le backend
WORKDIR /app/backend

# Copier les fichiers du backend
COPY backend/package.json ./
RUN npm install
COPY backend ./

# Définir le répertoire de travail pour le frontend
WORKDIR /app/frontend

# Copier les fichiers du frontend
# Copier les fichiers frontend
WORKDIR /app
COPY frontend/. ./frontend

# Revenir au répertoire backend pour démarrer le serveur
WORKDIR /app/backend

# Exposer le port sur lequel l'application s'exécute
EXPOSE 3000

# Commande pour démarrer le serveur backend
CMD ["node", "server.js"]
