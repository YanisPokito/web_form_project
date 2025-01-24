# Utiliser une image officielle de Node.js
FROM node:16

# Définir le répertoire de travail pour l'application
WORKDIR /app

# Copier les fichiers package.json et package-lock.json du backend
COPY backend/package*.json ./backend/

# Installer les dépendances du backend
WORKDIR /app/backend
RUN npm install

# Copier les autres fichiers du backend
COPY backend/ ./

# Copier les fichiers package.json et package-lock.json du frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./

# Installer les dépendances du frontend
RUN npm install

# Copier les autres fichiers du frontend
COPY frontend/ ./

# Revenir au répertoire backend pour démarrer le serveur
WORKDIR /app/backend

# Exposer le port de l'application
EXPOSE 3000

# Commande pour démarrer le serveur backend
CMD ["node", "server.js"]
