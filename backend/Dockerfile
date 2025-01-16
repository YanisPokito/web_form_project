# Utiliser une image Node.js officielle (version LTS recommandée)
FROM node:16

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier tous les fichiers de l'application dans le conteneur
COPY . .

# Exposer le port utilisé par votre application (assurez-vous que c'est bien 3000)
EXPOSE 3000

# Définir la commande pour démarrer le serveur
CMD ["npm", "start"]
