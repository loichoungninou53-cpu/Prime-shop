#!/bin/bash
# Script de déploiement GitHub pour Prime Shop
# Usage: ./push_to_github.sh https://github.com/VOTRE_NOM/VOTRE_DEPOT.git

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
  echo "❌ Erreur : Veuillez fournir l'URL de votre dépôt GitHub."
  echo "Exemple : ./push_to_github.sh https://github.com/mon-compte/prime-shop.git"
  exit 1
fi

echo "🚀 Connexion au dépôt GitHub distant : $REPO_URL"
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"
git branch -M main
git add .
git commit -m "feat: mise à jour Prime Shop Store" --allow-empty
echo "⬆️ Envoi des fichiers vers GitHub (main)..."
git push -u origin main

if [ $? -eq 0 ]; then
  echo "✅ SUCCÈS ! Votre boutique est sur GitHub."
  echo "Connectez maintenant Vercel.com ou Netlify.com à ce dépôt pour activer la mise à jour automatique à chaque commit !"
else
  echo "⚠️ Si GitHub demande une authentification, utilisez un Personal Access Token (PAT) ou configurez votre clé SSH."
fi
