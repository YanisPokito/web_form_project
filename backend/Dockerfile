# Utiliser une image Node.js officielle
FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers
COPY . .

# Exposer le port utilisé
EXPOSE 3000

# Démarrer l'application
CMD ["node", "server.js"]
