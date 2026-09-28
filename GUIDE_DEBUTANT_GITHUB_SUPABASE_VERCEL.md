# 🚀 GUIDE COMPLET DÉBUTANT : GITHUB, SUPABASE & VERCEL POUR PRIME SHOP

Ce guide pas-à-pas est spécialement rédigé pour vous accompagner de **A à Z**, sans aucun jargon compliqué. En suivant ces 3 étapes gratuites, votre boutique sera hébergée en ligne, connectée à une vraie base de données, et se mettra à jour automatiquement à chaque modification !

---

## 📋 SOMMAIRE
1. **Étape 1 : Mettre le projet sur GitHub** (Sauvegarde du code)
2. **Étape 2 : Configurer Supabase** (Base de données gratuite)
3. **Étape 3 : Déployer gratuitement sur Vercel** (Mise en ligne mondiale en 60 secondes)

---

## 🐙 ÉTAPE 1 : METTRE LE PROJET SUR GITHUB (Gratuit)

GitHub est un coffre-fort en ligne pour votre code.

1. Allez sur **[https://github.com](https://github.com)** et créez un compte gratuit (si ce n'est pas déjà fait).
2. Cliquez sur le bouton vert **"New"** (ou le `+` en haut à droite > **New repository**).
3. Donnez un nom à votre dépôt (ex: `prime-shop`).
4. Laissez l'option sur **Public** ou **Private** (les deux fonctionnent avec Vercel).
5. **Ne cochez pas** "Add a README file" ni ".gitignore" (notre projet contient déjà tout).
6. Cliquez sur **"Create repository"**.
7. GitHub vous affiche une URL qui ressemble à :  
   `https://github.com/votre-nom/prime-shop.git`
8. Dans votre terminal de projet, lancez simplement la commande suivante :
   ```bash
   ./push_to_github.sh https://github.com/votre-nom/prime-shop.git
   ```
   *(Remplacez par votre vrai lien GitHub)*

🎉 **C'est fait ! Tout votre code est maintenant sauvegardé sur GitHub.**

---

## ⚡ ÉTAPE 2 : CONFIGURER LA BASE DE DONNÉES SUPABASE (Gratuit)

Supabase vous fournit une base de données PostgreSQL complète et gratuite pour enregistrer vos produits, commandes et paramètres.

1. Rendez-vous sur **[https://supabase.com](https://supabase.com)** et connectez-vous avec votre compte GitHub (1 clic).
2. Cliquez sur **"New Project"**.
3. Renseignez :
   - **Name** : `Prime Shop`
   - **Database Password** : Définissez un mot de passe sécurisé (notez-le précieusement).
   - **Region** : Choisissez **EU (Frankfurt)** ou **EU (London)** (les plus proches de l'Afrique de l'Ouest).
   - **Pricing Plan** : `Free` (0 $/mois).
4. Cliquez sur **"Create new project"** et patientez environ 1 minute pendant que Supabase initialise votre serveur.
5. Une fois le projet prêt :
   - Dans le menu latéral gauche, cliquez sur l'icône **SQL Editor** (ou `>_`).
   - Cliquez sur **"+ New query"**.
   - Ouvrez le fichier **`supabase_schema.sql`** qui se trouve à la racine de votre projet Prime Shop.
   - Copiez l'intégralité du texte et collez-le dans la zone SQL de Supabase.
   - Cliquez sur le bouton vert **"Run"** (ou faites Ctrl+Entrée).

✅ **Résultat immédiat :** Vos 3 tables (`products`, `orders`, `store_settings`) ainsi que les règles de sécurité sont automatiquement créées et prêtes à l'emploi !

---

## 🌐 ÉTAPE 3 : DÉPLOYER AUTOMATIQUEMENT SUR VERCEL (Gratuit)

Vercel est la plateforme officielle recommandée pour faire tourner votre site avec un certificat SSL sécurisé (`https://`), un CDN ultra-rapide en Afrique et le rechargement automatique à chaque nouveau code !

1. Rendez-vous sur **[https://vercel.com](https://vercel.com)** et cliquez sur **"Sign Up"** > **"Continue with GitHub"**.
2. Sur votre tableau de bord Vercel, cliquez sur **"Add New..."** > **"Project"**.
3. Vercel détecte automatiquement vos dépôts GitHub. Trouvez **`prime-shop`** et cliquez sur **"Import"**.
4. Dans l'écran de configuration :
   - **Framework Preset** : Vite (détecté automatiquement).
   - **Root Directory** : `./` (laissez par défaut).
   - **Build Command** : `npm run build` (laissez par défaut).
   - **Output Directory** : `dist` (laissez par défaut).
5. Cliquez sur le gros bouton bleu **"Deploy"**.
6. En **45 secondes**, Vercel compile votre site et vous donne une URL officielle en direct :  
   `https://prime-shop-votre-nom.vercel.app`

💡 **Super pouvoir :** Désormais, dès que vous modifiez un fichier et le poussez sur GitHub, Vercel met à jour votre boutique en ligne automatiquement sans que vous n'ayez rien à faire !

---

## 🔐 GESTION PRIVÉE & SÉCURITÉ DE VOTRE BOUTIQUE

- **Accès à votre espace propriétaire :**
  Ajoutez `/#/gestion-prime` à la fin de votre lien Vercel (ex: `https://votre-site.vercel.app/#/gestion-prime`).
- **Mot de passe par défaut :** `admin123`.
- Vous pouvez changer ce mot de passe et l'URL secrète à tout moment dans l'onglet **Paramètres & Sécurité** de votre espace d'administration.
- **Raccourci clavier secret :** Depuis n'importe quelle page de la boutique, appuyez sur `Ctrl + Maj + A` pour ouvrir instantanément la porte secrète de gestion.

---

## 📱 NUMÉRO WHATSAPP & SUIVI DE COLIS

- Modifiez votre numéro WhatsApp directement dans l'admin : il se met à jour instantanément sur l'ensemble du site.
- Chaque commande génère un lien de suivi automatique `/#/suivi?id=PS-XXXX` envoyé directement dans le message WhatsApp du client !
