# 🚀 GUIDE TECHNIQUE & COMMERCIAL — PRIME SHOP (ÉDITION VIOLET MARBLE 2026)

Ce guide résume les fonctionnalités premium et les instructions pratiques pour exploiter votre boutique en ligne **PRIME SHOP**.

---

## 🎨 1. NOUVELLE IDENTITÉ VISUELLE & ARCHITECTURE AWWWARDS

### A. Style "Floating Shopping Constellation on White Marble"
- **Palette de Design Tokens de Précision** :
  - **Canvas Mist** : `#f2f4f5` (fond doux marbre blanc)
  - **Shop Violet** : `#5433eb` (accent vibrant pour la conversion)
  - **Pure White** : `#ffffff` (cartes produits et conteneurs)
  - **Ink Black** : `#050508` (typographie à fort contraste lisible sur tous les écrans)
  - **Rayon de Courbure** : `28px` sur toutes les cartes & `9999px` pour les pilules d'action
  - **Ombres Douces Duales** : `--shadow-sm` et `--shadow-pillow` pour un effet flottant organique

### B. Disposition Éditoriale Hero (Inspirée de la Référence Visuelle)
- **Configuration Responsive Spécifique Mobile & PC** :
  - **Sur Ordinateur (Desktop >= lg)** :
    - **Colonne Gauche** : Titre éditorial *« imagination meets craft »*, phrase d'accroche et liens verticaux interactifs (*Collection Prime, Nouveautés, Guide Gratuit, Say hey sur WhatsApp*).
    - **Centre** : Wordmark moderne *Prime Shop* + Mascotte tactile 3D en tricot lavande avec cœur rose moelleux, animation de lévitation douce (`animate-float-gentle`), compteur de likes interactif et curseur de démonstration interactif.
    - **Colonne Droite** : Titre *« let’s team up! bring us your idea* »*, note de livraison express 24h au Bénin et icônes réseaux sociaux (WhatsApp, Instagram, TikTok, Appel).
  - **Sur Mobile (< lg)** :
    - En-tête centré, wordmark Prime Shop, mascotte tactile 3D parfaitement proportionnée, badges d'accès rapide (*Boutique, WhatsApp direct, Nouveautés*).

### C. Défilement Ultra-Fluide avec Lenis & GSAP
- **Lenis Smooth Scroll** est intégré au cœur de l'application (`lenis` + `requestAnimationFrame`) pour une sensation de glisse soyeuse.
- **GSAP & Framer-Motion** animent les micro-interactions, les transitions de cartes et le carrousel infini.

### D. Section Vidéo Nouvelle Génération
- Intégration de la nouvelle vidéo : `https://videotourl.com/videos/1790287007789-37a4f2ac-e233-4735-8b61-479452c46037.mp4`.
- Marquee infini d'articles publicitaires en cartes oreiller flottantes (*pillow cards*) avec boutons de commande express 1-clic WhatsApp.
- Contrôles de lecture (Pause / Reprise) et coupure de son (Mute).

---

## 📝 2. COPIER-COLLER DE FICHES PRODUITS (MAKETOU, CHARIOW, CHATGPT)

Vous pouvez désormais **coller directement n'importe quelle description générée sur ChatGPT, Maketou, Chariow ou WhatsApp** dans le champ de description de votre produit :

### Fonctionnalités de rendu automatique (`RichDescriptionRenderer`) :
1. **Listes à puces automatiques** : Détecte les puces (`•`, `-`, `*`, `✅`, `👉`) et les convertit en pastilles modernes avec coche violette.
2. **Texte en gras** : Les marqueurs Markdown (`**texte en gras**`) ou balises HTML (`<b>`, `<strong>`) sont mis en valeur avec un contraste noir profond.
3. **Émojis & Titres de section** : Les titres comme `### Fiche Technique` ou `🔥 Points Forts` sont transformés en en-têtes avec badge étincelle.
4. **Bouton d'insertion de template en 1 Clic** : Dans l'administration, cliquez sur **« Insérer Template Maketou »** pour pré-remplir instantanément une structure de vente complète (Points forts, Spécifications, Unboxing, Garantie).
5. **Mode Éditeur / Aperçu Direct** : Visualisez le rendu exact de la fiche client avant même d'enregistrer !

---

## 🔐 3. ACCÈS SECRET À L'ESPACE ADMINISTRATEUR

L'administration de **Prime Shop** est totalement invisible pour le grand public.

### Pour y accéder :
1. **Via l'URL** : Ajoutez simplement à l'adresse web :
   `#/gestion-prime`
2. **Via le raccourci clavier** : Appuyez sur :
   `Ctrl + Shift + A` (ou `Cmd + Shift + A` sur Mac).
3. **Via le triple-clic** : Dans le pied de page, cliquez **3 fois de suite** sur le texte `© 2026 Prime Shop`.
4. **Code PIN d'accès par défaut** :
   `admin123` *(personnalisable dans vos paramètres)*.

---

## 🛒 4. GESTION DES COMMANDES & COMMERCE LOCAL AU BÉNIN

- **Devise Réelle** : FCFA (ex: `25 000 FCFA`, `65 000 FCFA`).
- **Commande Rapide en 3 Champs** :
  1. Nom et Prénom
  2. Numéro WhatsApp
  3. Ville & Quartier (Cotonou, Calavi, Porto-Novo, etc.)
- **Règlement** : Paiement en espèces à la livraison ou Mobile Money (MTN MoMo, Moov Money, Celtiis).
- **Confirmation WhatsApp Instantanée** : Génération automatique du message pré-rempli avec détail des articles, prix et adresse.

---

## 🚀 5. DÉPLOIEMENT GRATUIT À VIE (0 FCFA D'ABONNEMENT)

1. Déposez votre projet sur **GitHub**.
2. Connectez votre compte sur **Vercel.com** ou **Netlify.com**.
3. Cliquez sur **Import** : votre boutique est en ligne avec certificat SSL HTTPS gratuit et nom de domaine personnalisé !
