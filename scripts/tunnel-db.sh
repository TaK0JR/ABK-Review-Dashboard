#!/bin/bash
# Script pour créer un tunnel SSH vers la base de données OVH
# Permet d'accéder à la base distante comme si elle était locale

echo "🔧 Création du tunnel SSH vers la base de données OVH..."
echo "📌 La base distante sera accessible sur localhost:3307"
echo "⚠️  Gardez cette fenêtre ouverte pendant le développement"
echo ""

# Remplacez les valeurs suivantes :
SSH_USER="dash-abk-review"
SSH_HOST="votre-serveur.ovh.com"
SSH_PORT=22

# Créer le tunnel
# -N : Pas d'exécution de commande
# -L : Redirection de port local:hôte:port distant
ssh -N -L 3307:localhost:3306 $SSH_USER@$SSH_HOST -p $SSH_PORT

# Note : Le script restera en cours d'exécution
# Utilisez Ctrl+C pour fermer le tunnel