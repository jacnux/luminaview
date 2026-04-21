# Image de base Node.js Alpine
FROM node:18-alpine

# Répertoire de travail dans le conteneur
WORKDIR /app

# INSTALLATION DES OUTILS DE CONSTRUCTION
# Sharp a besoin de Python et de C++ pour être compilé sur Alpine
RUN apk add --no-cache python3 make g++

# --- NOUVEAU : Installation des polices pour le filigrane ---
RUN apk add --no-cache fontconfig ttf-dejavu
# ----------------------------------------------------------

# Copie des fichiers de gestion des paquets
COPY package*.json ./

# Installation de TOUTES les dépendances (y compris Sharp)
RUN npm install

# Copie du reste du code source
COPY . .


# Exposition du port
EXPOSE 3000

# Commande de démarrage (celle définie dans package.json : "npm run dev")
CMD ["npm", "run", "dev"]
