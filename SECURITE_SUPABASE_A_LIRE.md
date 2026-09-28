# 🔐 Sécurité Supabase — état actuel et prochaine étape

## Ce qui est en place (vérifié le 2026-09-29)
- ✅ RLS **activé** sur `products`, `orders`, `store_settings`.
- ✅ Aucune `service_role_key` dans le code : seule la clé `anon` (publique par nature) est utilisée.
- ✅ Requêtes sans clé → refusées (HTTP 401).
- ✅ La porte dérobée `admin123` (qui restait valide même après changement du PIN) a été supprimée.
- ✅ Tout écrit en base est confirmé avant affichage ; toute erreur est affichée à l'admin.

## ⚠️ Le point faible restant (à connaître)
Les politiques RLS actuelles (`Gestion complète …  USING (true)`) autorisent la clé `anon`
à **écrire** dans les tables. C'est ce qui permet à l'admin (protégé par PIN côté interface)
de publier sans compte Supabase. Conséquence : une personne technique qui récupère la clé
`anon` dans le code du site pourrait modifier vos produits directement via l'API.

Ce n'est PAS un bug d'aujourd'hui, c'est une limite d'architecture, et je ne peux pas
la corriger sans casser l'admin : la vraie solution nécessite un compte administrateur
Supabase Auth (email + mot de passe) — à faire quand vous le souhaitez.

## Prochaine étape recommandée (quand vous voudrez, ~20 min ensemble)
1. Supabase → Authentication → Users → « Add user » (votre email + mot de passe).
2. Remplacer l'écran PIN de l'admin par une connexion Supabase Auth (je m'en charge).
3. Exécuter ensuite ce SQL pour verrouiller l'écriture aux seuls comptes connectés :

```sql
-- NE PAS EXÉCUTER AVANT L'ÉTAPE 2, sinon l'admin ne pourra plus publier.
DROP POLICY IF EXISTS "Gestion complète produits"   ON public.products;
DROP POLICY IF EXISTS "Gestion complète commandes"  ON public.orders;
DROP POLICY IF EXISTS "Gestion complète paramètres" ON public.store_settings;

CREATE POLICY "Admin connecté gère les produits"   ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin connecté gère les commandes"  ON public.orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin connecté gère les paramètres" ON public.store_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- Les clients gardent : lecture des produits publiés, création d'une commande, lecture pour le suivi.
```
